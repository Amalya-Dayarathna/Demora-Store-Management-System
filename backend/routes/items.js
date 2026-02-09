const express = require('express');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const { generateCostPriceCode } = require('../utils/priceUtils');

const router = express.Router();
const prisma = new PrismaClient();

// Get items by business
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const items = await prisma.item.findMany({
      where: { businessId },
      include: {
        category: true,
        variants: {
          select: {
            stockQuantity: true
          }
        },
        _count: { select: { variants: true } }
      }
    });
    
    // Calculate total stock for each item (item stock + variant stocks)
    const itemsWithStock = items.map(item => ({
      ...item,
      totalStock: item.stockQuantity + item.variants.reduce((sum, variant) => sum + variant.stockQuantity, 0)
    }));
    
    res.json(itemsWithStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create item
router.post('/', async (req, res) => {
  try {
    const { itemName, categoryId, costPrice, sellingPrice, businessId, stockQuantity } = req.body;
    
    // Get category for code generation
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    // Generate base ref code
    const itemCount = await prisma.item.count({
      where: { categoryId }
    });
    const baseRefCode = `${category.categoryCode}-${String(itemCount + 1).padStart(3, '0')}`;
    
    // Generate cost price code
    const costPriceCode = generateCostPriceCode(Math.floor(parseFloat(costPrice)));
    
    const item = await prisma.item.create({
      data: {
        itemName,
        categoryId,
        baseRefCode,
        costPrice: parseFloat(costPrice),
        costPriceCode,
        sellingPrice: parseFloat(sellingPrice),
        stockQuantity: parseInt(stockQuantity || 0),
        businessId
      },
      include: { category: true }
    });
    
    // Record initial stock movement if stock > 0
    if (parseInt(stockQuantity || 0) > 0) {
      await prisma.stockMovement.create({
        data: {
          itemId: item.id,
          movementType: 'IN',
          quantity: parseInt(stockQuantity),
          reason: 'initial',
          businessId
        }
      });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, costPrice, sellingPrice, stockQuantity } = req.body;
    
    // Generate new cost price code
    const costPriceCode = generateCostPriceCode(Math.floor(parseFloat(costPrice)));
    
    const item = await prisma.item.update({
      where: { id },
      data: {
        itemName,
        costPrice: parseFloat(costPrice),
        costPriceCode,
        sellingPrice: parseFloat(sellingPrice),
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : undefined
      },
      include: { category: true }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate QR code image for item
router.get('/:id/qr-image', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.item.findUnique({
      where: { id }
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(item.baseRefCode);
    res.json({ qrCode: qrCodeDataURL });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item stock
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body;
    
    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const quantityNum = parseInt(quantity);
    const newStock = operation === 'add' 
      ? item.stockQuantity + quantityNum
      : item.stockQuantity - quantityNum;
    
    if (newStock < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    // Update stock and record movement in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.item.update({
        where: { id },
        data: { stockQuantity: newStock },
        include: { category: true }
      });
      
      // Record stock movement
      await tx.stockMovement.create({
        data: {
          itemId: id,
          movementType: operation === 'add' ? 'IN' : 'OUT',
          quantity: quantityNum,
          reason: 'adjustment',
          businessId: item.businessId
        }
      });
      
      return updatedItem;
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.item.delete({ where: { id } });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;