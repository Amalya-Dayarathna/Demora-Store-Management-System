const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { username }
    });
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create default admin user (for setup)
router.post('/setup', async (req, res) => {
  try {
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      return res.status(400).json({ error: 'Admin already exists' });
    }
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    res.json({ message: 'Admin user created', username: 'admin', password: 'admin123' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;