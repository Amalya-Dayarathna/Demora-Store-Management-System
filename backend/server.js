const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/businesses', authenticateToken, require('./routes/businesses'));
app.use('/api/categories', authenticateToken, require('./routes/categories'));
app.use('/api/items', authenticateToken, require('./routes/items'));
app.use('/api/variants', authenticateToken, require('./routes/variants'));
app.use('/api/images', authenticateToken, require('./routes/images'));
app.use('/api/bills', authenticateToken, require('./routes/bills'));
app.use('/api/cashflow', authenticateToken, require('./routes/cashflow'));
app.use('/api/reports', authenticateToken, require('./routes/reports'));
app.use('/api/stock-movements', authenticateToken, require('./routes/stockMovements'));
app.use('/api/gift-boxes', authenticateToken, require('./routes/giftBoxes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});