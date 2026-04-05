const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { generateCostPriceCode } = require('../utils/priceUtils');
const { generateItemBarcode, generateVariantBarcode } = require('../utils/barcodeGenerator');

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
        variantRecords: {
          select: {
            stockQuantity: true
          }
        },
        _count: { select: { variantRecords: true } }
      }
    });
    
    // Calculate total stock for each item (item stock + variant stocks)
    const itemsWithStock = items.map(item => ({
      ...item,
      totalStock: item.stockQuantity + item.variantRecords.reduce((sum, variant) => sum + variant.stockQuantity, 0)
    }));
    
    res.json(itemsWithStock);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create item
router.post('/', async (req, res) => {
  try {
    const { itemName, categoryId, costPrice, sellingPrice, businessId, stockQuantity, variants, tags } = req.body;
    
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    const itemCount = await prisma.item.count({
      where: { categoryId }
    });
    const baseRefCode = `${category.categoryCode}-${String(itemCount + 1).padStart(3, '0')}`;
    const costPriceCode = generateCostPriceCode(Math.floor(parseFloat(costPrice)));
    
    const totalStock = parseInt(stockQuantity || 0);
    if (variants && variants.length > 0) {
      const variantTotal = variants.reduce((sum, v) => sum + parseInt(v.quantity || 0), 0);
      if (variantTotal !== totalStock) {
        return res.status(400).json({ error: 'Total stock must equal sum of variant quantities' });
      }
      
      // Generate barcodes for inline variants
      variants.forEach((variant, index) => {
        variant.barcode = generateVariantBarcode(businessId, `${baseRefCode}-${index}`);
      });
    }
    
    const item = await prisma.item.create({
      data: {
        itemName,
        categoryId,
        baseRefCode,
        costPrice: parseFloat(costPrice),
        costPriceCode,
        sellingPrice: parseFloat(sellingPrice),
        stockQuantity: totalStock,
        barcode: generateItemBarcode(businessId, baseRefCode),
        variants: variants || [],
        tags: tags || [],
        businessId
      },
      include: { category: true }
    });
    
    if (totalStock > 0) {
      await prisma.stockMovement.create({
        data: {
          itemId: item.id,
          movementType: 'IN',
          quantity: totalStock,
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
    const { itemName, costPrice, sellingPrice, stockQuantity, variants, tags } = req.body;
    
    if (variants && variants.length > 0 && stockQuantity !== undefined) {
      const variantTotal = variants.reduce((sum, v) => sum + parseInt(v.quantity || 0), 0);
      if (variantTotal !== parseInt(stockQuantity)) {
        return res.status(400).json({ error: 'Total stock must equal sum of variant quantities' });
      }
      
      // Get existing item to preserve or generate barcodes
      const existingItem = await prisma.item.findUnique({ where: { id } });
      
      // Generate barcodes for new variants or preserve existing ones
      variants.forEach((variant, index) => {
        if (!variant.barcode) {
          variant.barcode = generateVariantBarcode(existingItem.businessId, `${existingItem.baseRefCode}-${index}`);
        }
      });
    }
    
    const costPriceCode = generateCostPriceCode(Math.floor(parseFloat(costPrice)));
    
    const item = await prisma.item.update({
      where: { id },
      data: {
        itemName,
        costPrice: parseFloat(costPrice),
        costPriceCode,
        sellingPrice: parseFloat(sellingPrice),
        stockQuantity: stockQuantity !== undefined ? parseInt(stockQuantity) : undefined,
        variants: variants !== undefined ? variants : undefined,
        tags: tags !== undefined ? tags : undefined
      },
      include: { category: true }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get barcode by scan (supports inline variant barcodes)
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    
    // Check if it's an item barcode
    const item = await prisma.item.findUnique({
      where: { barcode },
      include: {
        category: true,
        variantRecords: true
      }
    });
    
    if (item) {
      return res.json({
        type: 'item',
        data: item
      });
    }
    
    // Check if it's an inline variant barcode
    const itemsWithVariants = await prisma.item.findMany({
      where: {
        variants: {
          path: '$[*].barcode',
          array_contains: barcode
        }
      },
      include: {
        category: true
      }
    });
    
    if (itemsWithVariants.length > 0) {
      const item = itemsWithVariants[0];
      const variantIndex = item.variants.findIndex(v => v.barcode === barcode);
      
      if (variantIndex !== -1) {
        return res.json({
          type: 'inline-variant',
          data: {
            id: `${item.id}-${variantIndex}`,
            itemId: item.id,
            variantIndex,
            variant: item.variants[variantIndex],
            item: item,
            barcode: barcode
          }
        });
      }
    }
    
    // Check if it's a variant barcode
    const variant = await prisma.variant.findUnique({
      where: { barcode },
      include: {
        item: {
          include: {
            category: true
          }
        }
      }
    });
    
    if (variant) {
      return res.json({
        type: 'variant',
        data: variant
      });
    }
    
    res.status(404).json({ error: 'Barcode not found' });
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