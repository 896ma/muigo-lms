require('dotenv').config();
const express = require('express');
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
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin, credentials: true }));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

// health
app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

const mongoUri = process.env.MONGO_URI;
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
