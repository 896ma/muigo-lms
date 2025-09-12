require('dotenv').config();
const express = require('express');

// Set default environment variables if not provided
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmers-lms';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_this_in_production';
// Paystack configuration - will use keys from .env file
// Make sure to set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in your .env file
console.log('Paystack Secret Key loaded:', process.env.PAYSTACK_SECRET_KEY ? 'Yes' : 'No');
console.log('Paystack Public Key loaded:', process.env.PAYSTACK_PUBLIC_KEY ? 'Yes' : 'No');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const paymentRoutes = require('./routes/payments');
const enrollmentRoutes = require('./routes/enrollments');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
// CORS configuration - allow all origins for development
app.use(cors({ 
	origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Debug middleware
app.use((req, res, next) => {
	console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
	next();
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

// health
app.get('/health', (req, res) => {
	res.json({ 
		status: 'ok', 
		timestamp: new Date().toISOString(),
		mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
	});
});

// Simple test endpoint
app.get('/test', (req, res) => {
	res.json({ 
		message: 'Backend is working!', 
		timestamp: new Date().toISOString(),
		mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
	});
});

const mongoUri = process.env.MONGO_URI || 'mongodb+srv://Muigo:lucy17@cluster0.4z7ofja.mongodb.net/farmers-lms';
if (mongoUri) {
	mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
		.then(() => {
			console.log('MongoDB connected');
			app.listen(PORT, () => console.log(`Server running on ${PORT}`));
		})
		.catch(err => {
			console.error('MongoDB connection error:', err.message);
			app.listen(PORT, () => console.log(`Server running without DB on ${PORT}`));
		});
} else {
	console.warn('MONGO_URI not set. Starting server without DB connection.');
	app.listen(PORT, () => console.log(`Server running without DB on ${PORT}`));
}
