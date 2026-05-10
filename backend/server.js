const dotenvPath = require('path').resolve(__dirname, '../.env');
require('dotenv').config({ path: dotenvPath });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const config = require('./config');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const paymentRoutes = require('./routes/payments');
const enrollmentRoutes = require('./routes/enrollments');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin for health checks and API endpoints
    if (!origin) {
      return callback(null, true);
    }
    
    // Allow Vercel domains and localhost for development
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'https://muigo-farmers-lms.onrender.com',
      'https://muigo-farmers-lms.vercel.app',
      'https://muigo-farmers-c2obpa4yi-896mas-projects.vercel.app',
      'http://localhost:3000',
      'https://*.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        // Handle wildcard patterns like https://*.vercel.app
        const regex = new RegExp('^' + allowedOrigin.replace('.', '\\.').replace('*', '.+') + '$');
        return regex.test(origin);
      }
      return origin === allowedOrigin;
    }) || origin.startsWith('http://localhost:'); // Allow any localhost port for development
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
};

app.use(cors(corsOptions));

// Content Security Policy to allow required external resources (Tailwind CDN, Unsplash, Paystack)
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
      ],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: [
        "'self'",
        'data:',
        'https://images.unsplash.com'
      ],
      connectSrc: [
        "'self'",
        'http://localhost:5000',
        'https://muigo-farmers-lms.onrender.com',
        'https://api.paystack.co'
      ],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: null
    }
  })
);

// Health check endpoint for Render
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbConnected = dbState === 1;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbConnected,
      state: dbStates[dbState] || 'unknown'
    }
  });
});


// API info endpoint (moved to /api/info)
app.get('/api/info', (req, res) => {
  res.json({ 
    message: 'Farmers LMS API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      courses: '/api/courses',
      payments: '/api/payments',
      enrollments: '/api/enrollments',
      admin: '/api/admin'
    }
  });
});

// Debug endpoint — shows env var presence without exposing values
app.get('/api/debug', (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV || 'not set',
    port: process.env.PORT || 'not set',
    env_vars: {
      MONGO_URI: process.env.MONGO_URI ? `set (${process.env.MONGO_URI.substring(0, 20)}...)` : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'NOT SET',
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY ? 'set' : 'NOT SET',
      PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY ? 'set' : 'NOT SET',
      FRONTEND_URL: process.env.FRONTEND_URL || 'not set',
    },
    database: {
      state: ['disconnected','connected','connecting','disconnecting'][dbState] || 'unknown',
      readyState: dbState,
    },
    uptime_seconds: Math.floor(process.uptime()),
  });
});

// Structured request/response logging (always-on for Vercel debugging)
app.use((req, res, next) => {
  const start = Date.now();
  const ts = new Date().toISOString();
  console.log(`[REQ] ${ts} ${req.method} ${req.path} | origin=${req.headers.origin || '-'} | ip=${req.ip}`);
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[RES] ${new Date().toISOString()} ${req.method} ${req.path} | status=${res.statusCode} | ${ms}ms`);
  });
  next();
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch-all handler: send back React's index.html file for any non-API routes
app.use((req, res, next) => {
  // Only serve the React app for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

const PORT = process.env.PORT || config.PORT || 5000;

// Server configuration loaded
console.log('Starting Farmers LMS API Server...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Port:', PORT);

const mongoUri = process.env.MONGO_URI || config.MONGO_URI || 'mongodb://localhost:27017/farmers-lms';
console.log('MongoDB URI source:', process.env.MONGO_URI ? 'environment variable' : config.MONGO_URI ? 'config.js' : 'localhost fallback');

// Start server first, then connect to database
const startServer = () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/info`);
    }
  });
};

// Try to connect to MongoDB with a short timeout so API can still boot
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
})
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    startServer();
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Starting server without database connection...');
      console.log('📝 To fix this, please:');
      console.log('   1. Set up MongoDB Atlas and update MONGO_URI environment variable');
      console.log('   2. Or use: mongodb://localhost:27017/farmers-lms if MongoDB is running locally');
    }
    
    // Start server anyway (for Render deployment)
    startServer();
  });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
  });
  
 