const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const pickupRoutes = require('./routes/pickup.routes');
const adminRoutes = require('./routes/admin.routes');
const prisma = require('./database/prisma');
const { success } = require('./utils/response');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false, // Allows images from Unsplash and scripts from Razorpay CDN
}));

// CORS Configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during local development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token'],
}));

// Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  return success(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'QuickPick Grocery Click & Collect API',
    uptime: process.uptime(),
  });
});

// One-Click Database Seed Endpoint
app.post('/api/seed', async (req, res) => {
  try {
    const { execSync } = require('child_process');
    const path = require('path');
    const schemaFile = process.env.DATABASE_URL?.startsWith('file:')
      ? 'prisma/schema.prisma'
      : 'prisma/schema.postgresql.prisma';

    try {
      execSync(`npx prisma db push --schema=${schemaFile} --accept-data-loss`, {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..'),
      });
    } catch (pushErr) {
      console.warn('Schema push note:', pushErr.message);
    }

    const { seedDatabase } = require('./database/seed');
    await seedDatabase();
    return success(res, null, 'Grocery catalog, categories & demo accounts seeded successfully!');
  } catch (err) {
    console.error('Seed endpoint error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Public Shop Information Endpoint
app.get('/api/settings/public', async (req, res, next) => {
  try {
    const settings = await prisma.shopSettings.findUnique({
      where: { id: 'shop-settings-primary' },
      select: {
        shopName: true,
        tagline: true,
        phone: true,
        email: true,
        address: true,
        openingTime: true,
        closingTime: true,
        slotDurationMinutes: true,
        isShopOpen: true,
        acceptAsap: true,
        taxRate: true,
        currency: true,
        minOrderAmount: true,
        razorpayKeyId: true,
      },
    });
    return success(res, settings, 'Store information fetched');
  } catch (err) {
    next(err);
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/admin', adminRoutes);

// Static Client Serving (Production & Standalone)
const path = require('path');
const fs = require('fs');
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Catch 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
