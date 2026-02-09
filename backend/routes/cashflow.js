const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get cashflow summary
router.get('/:businessId/summary', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const [capitalInvestments, capitalOutflows, income, expenses] = await Promise.all([
      prisma.capital.aggregate({
        where: { 
          businessId,
          type: 'investment'
        },
        _sum: { amount: true, settled: true }
      }),
      prisma.capital.aggregate({
        where: { 
          businessId,
          type: {
            in: ['settlement', 'salary', 'profit_distribution']
          }
        },
        _sum: { amount: true }
      }),
      prisma.income.aggregate({
        where: { businessId },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { businessId },
        _sum: { amount: true }
      })
    ]);
    
    const totalCapital = capitalInvestments._sum.amount || 0;
    const settledCapital = capitalInvestments._sum.settled || 0;
    const totalOutflows = Math.abs(capitalOutflows._sum.amount || 0); // Convert to positive for display
    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    
    res.json({
      totalCapital,
      settledCapital,
      remainingCapital: totalCapital - settledCapital,
      totalIncome,
      totalExpenses,
      netCashflow: totalIncome - totalExpenses - totalOutflows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Capital routes
router.get('/:businessId/capital', async (req, res) => {
  try {
    const { businessId } = req.params;
    const capital = await prisma.capital.findMany({
      where: { businessId },
      orderBy: { date: 'desc' }
    });
    res.json(capital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/capital', async (req, res) => {
  try {
    const { amount, givenBy, businessId, date } = req.body;
    const capital = await prisma.capital.create({
      data: {
        amount: parseFloat(amount),
        givenBy,
        businessId,
        date: date ? new Date(date) : new Date()
      }
    });
    res.json(capital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/capital/:id/settle', async (req, res) => {
  try {
    const { id } = req.params;
    const { settleAmount } = req.body;
    
    const capital = await prisma.capital.findUnique({ where: { id } });
    if (!capital) {
      return res.status(404).json({ error: 'Capital not found' });
    }
    
    const newSettled = capital.settled + parseFloat(settleAmount);
    if (newSettled > capital.amount) {
      return res.status(400).json({ error: 'Settlement amount exceeds remaining capital' });
    }
    
    // Create capital record for settlement (negative amount for outflow)
    await prisma.capital.create({
      data: {
        amount: -parseFloat(settleAmount),
        givenBy: capital.givenBy,
        type: 'settlement',
        description: `Capital settlement to ${capital.givenBy}`,
        businessId: capital.businessId
      }
    });
    
    // Update capital settlement
    const updatedCapital = await prisma.capital.update({
      where: { id },
      data: { settled: newSettled }
    });
    
    res.json(updatedCapital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Income routes
router.get('/:businessId/income', async (req, res) => {
  try {
    const { businessId } = req.params;
    const income = await prisma.income.findMany({
      where: { businessId },
      orderBy: { date: 'desc' }
    });
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/income', async (req, res) => {
  try {
    const { amount, description, businessId, date } = req.body;
    const income = await prisma.income.create({
      data: {
        amount: parseFloat(amount),
        description,
        businessId,
        date: date ? new Date(date) : new Date()
      }
    });
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Expense routes
router.get('/:businessId/expenses', async (req, res) => {
  try {
    const { businessId } = req.params;
    const expenses = await prisma.expense.findMany({
      where: { businessId },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/expenses', async (req, res) => {
  try {
    const { amount, description, category, businessId, date } = req.body;
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        category,
        businessId,
        date: date ? new Date(date) : new Date()
      }
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update capital
router.put('/capital/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, givenBy } = req.body;
    
    const capital = await prisma.capital.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        givenBy
      }
    });
    
    res.json(capital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete capital
router.delete('/capital/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.capital.delete({ where: { id } });
    res.json({ message: 'Capital deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update income
router.put('/income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;
    
    const income = await prisma.income.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        description
      }
    });
    
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete income
router.delete('/income/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.income.delete({ where: { id } });
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update expense
router.put('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, category } = req.body;
    
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        description,
        category
      }
    });
    
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
router.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pay salary
router.post('/salary', async (req, res) => {
  try {
    const { amount, employeeName, businessId, description } = req.body;
    
    // Create capital record for salary (negative amount for outflow)
    const capital = await prisma.capital.create({
      data: {
        amount: -parseFloat(amount),
        givenBy: employeeName,
        type: 'salary',
        description: description || `Salary paid to ${employeeName}`,
        businessId
      }
    });
    
    res.json(capital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Distribute profit to partner
router.post('/profit-distribution', async (req, res) => {
  try {
    const { amount, partnerName, businessId, description } = req.body;
    
    // Create capital record for profit distribution (negative amount for outflow)
    const capital = await prisma.capital.create({
      data: {
        amount: -parseFloat(amount),
        givenBy: partnerName,
        type: 'profit_distribution',
        description: description || `Profit distributed to ${partnerName}`,
        businessId
      }
    });
    
    res.json(capital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get full cashflow history
router.get('/:businessId/full-cashflow', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const [capital, income, expenses] = await Promise.all([
      prisma.capital.findMany({
        where: { businessId },
        select: { id: true, amount: true, givenBy: true, type: true, description: true, date: true }
      }),
      prisma.income.findMany({
        where: { businessId },
        select: { id: true, amount: true, description: true, date: true }
      }),
      prisma.expense.findMany({
        where: { businessId },
        select: { id: true, amount: true, description: true, category: true, date: true }
      })
    ]);
    
    // Combine all transactions
    const transactions = [
      ...capital.map(c => ({ ...c, type: c.type === 'investment' ? 'capital' : c.type })),
      ...income.map(i => ({ ...i, type: 'income' })),
      ...expenses.map(e => ({ ...e, type: 'expense', amount: -e.amount }))
    ];
    
    // Sort by date ascending for balance calculation
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate running balance
    let runningBalance = 0;
    const transactionsWithBalance = transactions.map(transaction => {
      runningBalance += transaction.amount;
      return { ...transaction, balance: runningBalance };
    });
    
    // Sort by date descending for display
    transactionsWithBalance.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(transactionsWithBalance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;