const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all businesses
router.get('/', async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create business
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const business = await prisma.business.create({
      data: { name, description, color: color || '#000000' }
    });
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update business
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, color } = req.body;
    
    const business = await prisma.business.update({
      where: { id },
      data: { name, description, status, color }
    });
    res.json(business);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete business
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.business.delete({ where: { id } });
    res.json({ message: 'Business deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;