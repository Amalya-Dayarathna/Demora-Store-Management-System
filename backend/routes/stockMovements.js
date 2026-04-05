const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get stock movements summary by item
router.get('/:businessId/summary', async (req, res) => {
  try {
    const { businessId } = req.params;
    
    // Get all items with their stock movements
    const items = await prisma.item.findMany({
      where: { businessId },
      include: {
        category: true,
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Last 10 movements per item
        },
        variantRecords: {
          include: {
            stockMovements: {
              orderBy: { createdAt: 'desc' },
              take: 10 // Last 10 movements per variant
            }
          }
        }
      }
    });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stock movements by business
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { itemId, variantId } = req.query;
    
    const whereClause = { businessId };
    if (itemId) whereClause.itemId = itemId;
    if (variantId) whereClause.variantId = variantId;
    
    const movements = await prisma.stockMovement.findMany({
      where: whereClause,
      include: {
        item: {
          include: { category: true }
        },
        variant: {
          include: {
            item: {
              include: { category: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;