const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get categories by business
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const categories = await prisma.category.findMany({
      where: { businessId },
      include: { _count: { select: { items: true } } }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const { categoryName, categoryCode, businessId } = req.body;
    
    const category = await prisma.category.create({
      data: { categoryName, categoryCode, businessId }
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, categoryCode } = req.body;
    
    const category = await prisma.category.update({
      where: { id },
      data: { categoryName, categoryCode }
    });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;