const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Test database connection on startup
(async () => {
  try {
    await prisma.user.findFirst();
    console.log('\n✅ DATABASE CONNECTED: Successfully connected to Supabase\n');
  } catch (error) {
    console.error('\n❌ DATABASE CONNECTION FAILED:', error.message);
    console.error('Error code:', error.code, '\n');
  }
})();

// app.use(cors());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://demora.lk',
    'https://admin.demora.lk'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

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

// Health check endpoint (before routes)
app.get('/health', async (req, res) => {
  try {
    await prisma.user.findFirst();
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

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

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`${'='.repeat(60)}\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Shutting down server...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Monitor connection every 30 seconds
setInterval(async () => {
  try {
    // Use a simple query that doesn't use prepared statements
    await prisma.user.findFirst();
    console.log(`[${new Date().toLocaleTimeString()}] ✅ Database: Connected`);
  } catch (error) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ Database: Disconnected - ${error.message}`);
  }
}, 30000);