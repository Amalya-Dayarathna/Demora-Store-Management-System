const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get gift boxes by business
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const giftBoxes = await prisma.giftBox.findMany({
      where: { businessId },
      include: {
        items: {
          include: {
            item: {
              include: { category: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(giftBoxes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create gift box
router.post('/', async (req, res) => {
  try {
    const { name, description, packingCost, sellingPrice, items, businessId } = req.body;
    
    // Generate gift box code
    const giftBoxCount = await prisma.giftBox.count({
      where: { businessId }
    });
    const giftBoxCode = `GX-${String(giftBoxCount + 1).padStart(3, '0')}`;
    
    // Calculate total cost
    let totalItemCost = 0;
    for (const item of items) {
      const itemData = await prisma.item.findUnique({
        where: { id: item.itemId }
      });
      totalItemCost += itemData.costPrice * item.quantity;
    }
    
    const totalCost = totalItemCost + parseFloat(packingCost || 0);
    
    const giftBox = await prisma.giftBox.create({
      data: {
        name,
        giftBoxCode,
        description,
        packingCost: parseFloat(packingCost || 0),
        totalCost,
        sellingPrice: parseFloat(sellingPrice || 0),
        businessId,
        items: {
          create: items.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: {
          include: {
            item: {
              include: { category: true }
            }
          }
        }
      }
    });
    
    res.json(giftBox);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update gift box
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, packingCost, items } = req.body;
    
    // Calculate total cost
    let totalItemCost = 0;
    for (const item of items) {
      const itemData = await prisma.item.findUnique({
        where: { id: item.itemId }
      });
      totalItemCost += itemData.sellingPrice * item.quantity;
    }
    
    const totalCost = totalItemCost + parseFloat(packingCost || 0);
    
    // Update gift box and items in transaction
    const giftBox = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.giftBoxItem.deleteMany({
        where: { giftBoxId: id }
      });
      
      // Update gift box and create new items
      return await tx.giftBox.update({
        where: { id },
        data: {
          name,
          description,
          packingCost: parseFloat(packingCost || 0),
          totalCost,
          items: {
            create: items.map(item => ({
              itemId: item.itemId,
              quantity: item.quantity
            }))
          }
        },
        include: {
          items: {
            include: {
              item: {
                include: { category: true }
              }
            }
          }
        }
      });
    });
    
    res.json(giftBox);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete gift box
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.giftBox.delete({ where: { id } });
    res.json({ message: 'Gift box deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;