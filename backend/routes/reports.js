const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Inventory report
router.get('/:businessId/inventory', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const [variants, items] = await Promise.all([
      prisma.variant.findMany({
        where: { businessId },
        include: {
          item: {
            include: { category: true }
          }
        },
        orderBy: { stockQuantity: 'asc' }
      }),
      prisma.item.findMany({
        where: { businessId },
        include: { category: true }
      })
    ]);
    
    // Calculate stock analysis
    let totalCostValue = 0;
    let totalSellingValue = 0;
    let totalItems = 0;
    
    // Calculate for variants
    variants.forEach(variant => {
      const costValue = variant.item.costPrice * variant.stockQuantity;
      const sellingValue = variant.item.sellingPrice * variant.stockQuantity;
      totalCostValue += costValue;
      totalSellingValue += sellingValue;
      totalItems += variant.stockQuantity;
    });
    
    // Calculate for items (direct stock)
    items.forEach(item => {
      const costValue = item.costPrice * item.stockQuantity;
      const sellingValue = item.sellingPrice * item.stockQuantity;
      totalCostValue += costValue;
      totalSellingValue += sellingValue;
      totalItems += item.stockQuantity;
    });
    
    const totalProfit = totalSellingValue - totalCostValue;
    
    const lowStock = variants.filter(v => v.stockQuantity <= 5 && v.stockQuantity > 0);
    const outOfStock = variants.filter(v => v.stockQuantity === 0);
    
    res.json({
      totalVariants: variants.length,
      lowStock: lowStock.length,
      outOfStock: outOfStock.length,
      variants,
      lowStockItems: lowStock,
      outOfStockItems: outOfStock,
      stockAnalysis: {
        totalCostValue,
        totalSellingValue,
        totalProfit,
        totalItems
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales report
router.get('/:businessId/sales', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    const whereClause = { businessId };
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    const bills = await prisma.bill.findMany({
      where: whereClause,
      include: {
        billItems: {
          include: {
            variant: {
              include: {
                item: {
                  include: { category: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const totalSales = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const totalOrders = bills.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Sales by status
    const statusCounts = bills.reduce((acc, bill) => {
      acc[bill.status] = (acc[bill.status] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      totalSales,
      totalOrders,
      avgOrderValue,
      statusCounts,
      bills
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cashflow report
router.get('/:businessId/cashflow', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    const [capital, income, expenses] = await Promise.all([
      prisma.capital.findMany({
        where: { businessId, ...dateFilter },
        orderBy: { date: 'desc' }
      }),
      prisma.income.findMany({
        where: { businessId, ...dateFilter },
        orderBy: { date: 'desc' }
      }),
      prisma.expense.findMany({
        where: { businessId, ...dateFilter },
        orderBy: { date: 'desc' }
      })
    ]);
    
    const totalCapital = capital.reduce((sum, c) => sum + c.amount, 0);
    const settledCapital = capital.reduce((sum, c) => sum + c.settled, 0);
    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    
    res.json({
      summary: {
        totalCapital,
        settledCapital,
        remainingCapital: totalCapital - settledCapital,
        totalIncome,
        totalExpenses,
        netCashflow: totalIncome - totalExpenses
      },
      expensesByCategory,
      transactions: {
        capital,
        income,
        expenses
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Capital settlement report
router.get('/:businessId/capital-settlement', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const capitalByMember = await prisma.capital.groupBy({
      by: ['givenBy'],
      where: { businessId },
      _sum: {
        amount: true,
        settled: true
      }
    });
    
    const settlementReport = capitalByMember.map(member => ({
      member: member.givenBy,
      totalCapital: member._sum.amount || 0,
      settledAmount: member._sum.settled || 0,
      remainingBalance: (member._sum.amount || 0) - (member._sum.settled || 0)
    }));
    
    res.json(settlementReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;