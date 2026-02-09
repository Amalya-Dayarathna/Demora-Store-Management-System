const express = require('express');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get variants by business
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const variants = await prisma.variant.findMany({
      where: { businessId },
      include: {
        item: {
          include: { category: true }
        }
      },
      orderBy: { variantCode: 'asc' }
    });
    res.json(variants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get variant by QR code (supports both variant and item QR codes)
router.get('/qr/:qrCode', async (req, res) => {
  try {
    const { qrCode } = req.params;
    const { businessId } = req.query; // Get business ID from query params
    
    // First try to find variant by QR code
    let variant = await prisma.variant.findFirst({
      where: { qrCodeValue: qrCode },
      include: {
        item: {
          include: { category: true }
        }
      }
    });
    
    // If no variant found, try to find item by baseRefCode and create virtual variant
    if (!variant) {
      const whereClause = { baseRefCode: qrCode };
      if (businessId) {
        whereClause.businessId = businessId;
      }
      
      const item = await prisma.item.findFirst({
        where: whereClause,
        include: { category: true }
      });
      
      if (item && item.stockQuantity > 0) {
        // Create virtual variant for item
        variant = {
          id: `item-${item.id}`,
          itemId: item.id,
          variantCode: item.baseRefCode,
          attributes: {},
          stockQuantity: item.stockQuantity,
          qrCodeValue: item.baseRefCode,
          businessId: item.businessId,
          item: item,
          isItemVariant: true
        };
      }
    }
    
    if (!variant) {
      return res.status(404).json({ error: 'Item or variant not found' });
    }
    
    res.json(variant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create variant
router.post('/', async (req, res) => {
  try {
    const { itemId, attributes, stockQuantity, businessId } = req.body;
    
    // Get item for code generation
    const item = await prisma.item.findUnique({
      where: { id: itemId }
    });
    
    // Generate variant code
    let variantCode = item.baseRefCode;
    if (attributes.color) {
      variantCode += `-${attributes.color.charAt(0).toUpperCase()}`;
    }
    if (attributes.size) {
      variantCode += `-${attributes.size}`;
    }
    
    const variant = await prisma.variant.create({
      data: {
        itemId,
        variantCode,
        attributes,
        stockQuantity: parseInt(stockQuantity),
        qrCodeValue: variantCode,
        businessId
      },
      include: {
        item: {
          include: { category: true }
        }
      }
    });
    
    // Record initial stock movement if stock > 0
    if (parseInt(stockQuantity) > 0) {
      await prisma.stockMovement.create({
        data: {
          variantId: variant.id,
          movementType: 'IN',
          quantity: parseInt(stockQuantity),
          reason: 'initial',
          businessId
        }
      });
    }
    
    res.json(variant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update stock
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'
    
    const variant = await prisma.variant.findUnique({
      where: { id }
    });
    
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    const quantityNum = parseInt(quantity);
    const newStock = operation === 'add' 
      ? variant.stockQuantity + quantityNum
      : variant.stockQuantity - quantityNum;
    
    if (newStock < 0) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }
    
    // Update stock and record movement in transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedVariant = await tx.variant.update({
        where: { id },
        data: { stockQuantity: newStock },
        include: {
          item: {
            include: { category: true }
          }
        }
      });
      
      // Record stock movement
      await tx.stockMovement.create({
        data: {
          variantId: id,
          movementType: operation === 'add' ? 'IN' : 'OUT',
          quantity: quantityNum,
          reason: 'adjustment',
          businessId: variant.businessId
        }
      });
      
      return updatedVariant;
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate QR code image
router.get('/:id/qr-image', async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await prisma.variant.findUnique({
      where: { id }
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(variant.qrCodeValue);
    res.json({ qrCode: qrCodeDataURL });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete variant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.variant.delete({ where: { id } });
    res.json({ message: 'Variant deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;