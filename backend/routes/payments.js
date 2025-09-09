const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/course');
const requireAuth = require('../middleware/auth');
const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

const router = express.Router();

router.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Initialize Paystack payment
router.post('/initialize', requireAuth, async (req, res) => {
	try {
		const { courseId, email } = req.body;
		
		if (!courseId || !email) {
			return res.status(400).json({ message: 'Course ID and email are required' });
		}

		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		if (course.isFree || course.price === 0) {
			return res.status(400).json({ message: 'Course is free' });
		}

		// Check if already enrolled
		const existingEnrollment = await Enrollment.findOne({ 
			user: req.user.id, 
			course: course._id 
		});
		if (existingEnrollment) {
			return res.status(400).json({ message: 'Already enrolled in this course' });
		}

		// Initialize Paystack payment
		const paymentData = {
			email: email,
			amount: course.price * 100, // Paystack expects amount in kobo (smallest currency unit)
			currency: course.currency || 'KES',
			reference: `course_${course._id}_${Date.now()}`,
			metadata: {
				courseId: course._id.toString(),
				userId: req.user.id,
				courseTitle: course.title
			}
		};

		const response = await paystack.transaction.initialize(paymentData);
		
		res.json({
			authorization_url: response.data.authorization_url,
			access_code: response.data.access_code,
			reference: response.data.reference
		});

	} catch (error) {
		console.error('Paystack initialization error:', error);
		res.status(500).json({ message: 'Payment initialization failed' });
	}
});

// Verify Paystack payment and enroll user
router.post('/verify', requireAuth, async (req, res) => {
	try {
		const { reference } = req.body;
		
		if (!reference) {
			return res.status(400).json({ message: 'Reference is required' });
		}

		// Verify payment with Paystack
		const response = await paystack.transaction.verify(reference);
		
		if (response.data.status === 'success') {
			const { courseId, userId } = response.data.metadata;
			
			// Verify the user matches
			if (userId !== req.user.id) {
				return res.status(403).json({ message: 'Unauthorized' });
			}

			// Create enrollment
			const enrollment = await Enrollment.create({
				user: req.user.id,
				course: courseId,
				status: 'active'
			});

			res.json({ 
				message: 'Payment successful, course enrolled!', 
				enrollmentId: enrollment._id,
				payment: response.data
			});
		} else {
			res.status(400).json({ message: 'Payment verification failed' });
		}

	} catch (error) {
		console.error('Payment verification error:', error);
		res.status(500).json({ message: 'Payment verification failed' });
	}
});

// Fallback: Simulated payment success endpoint (for testing)
router.post('/checkout', requireAuth, async (req, res) => {
	const { courseId } = req.body || {};
	const course = await Course.findById(courseId);
	if (!course) return res.status(404).json({ message: 'Course not found' });
	if (course.isFree || course.price === 0) {
		return res.status(400).json({ message: 'Course is free' });
	}
	let enrollment = await Enrollment.findOne({ user: req.user.id, course: course._id });
	if (!enrollment) {
		enrollment = await Enrollment.create({ user: req.user.id, course: course._id, status: 'active' });
	}
	res.json({ message: 'Payment recorded and enrollment active', enrollmentId: enrollment._id });
});

module.exports = router;



