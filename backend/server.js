require('dotenv').config({ path: '../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
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
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || config.PORT || 5000;

console.log('MONGO_URI from env:', process.env.MONGO_URI);
console.log('MONGO_URI from config:', config.MONGO_URI);
console.log('PORT:', PORT);

const mongoUri = process.env.MONGO_URI || config.MONGO_URI || 'mongodb://localhost:27017/farmers-lms';
console.log('Using MONGO_URI:', mongoUri);

// Try to connect to MongoDB, but don't fail if it's not available
mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    console.log('Starting server without database connection...');
    console.log('To fix this, please:');
    console.log('1. Install MongoDB locally, OR');
    console.log('2. Set up MongoDB Atlas and update MONGO_URI in .env file');
    console.log('3. Or use: mongodb://localhost:27017/farmers-lms if MongoDB is running');
    
    // Start server anyway for development
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT} (without database)`);
      console.log('Note: Database features will not work until MongoDB is connected');
    });
  });
  
 