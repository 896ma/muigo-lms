const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/course');
const requireAuth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

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

		if (!PAYSTACK_SECRET_KEY) {
			return res.status(500).json({ message: 'Paystack not configured. Please set PAYSTACK_SECRET_KEY in environment variables.' });
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

		// Generate unique reference
		const reference = `course_${course._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Initialize Paystack payment using axios
		const paymentData = {
			email: email,
			amount: course.price * 100, // Paystack expects amount in kobo (smallest currency unit)
			currency: course.currency || 'KES',
			reference: reference,
			metadata: {
				courseId: course._id.toString(),
				userId: req.user.id,
				courseTitle: course.title
			},
			callback_url: `${process.env.FRONTEND_URL}/payment-callback`
		};

		const response = await axios.post(
			`${PAYSTACK_BASE_URL}/transaction/initialize`,
			paymentData,
			{
				headers: {
					'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);
		
		if (response.data.status) {
			res.json({
				authorization_url: response.data.data.authorization_url,
				access_code: response.data.data.access_code,
				reference: response.data.data.reference
			});
		} else {
			throw new Error(response.data.message || 'Payment initialization failed');
		}

	} catch (error) {
		console.error('Paystack initialization error:', error);
		res.status(500).json({ 
			message: 'Payment initialization failed', 
			error: error.response?.data?.message || error.message 
		});
	}
});

// Verify Paystack payment and enroll user
router.post('/verify', requireAuth, async (req, res) => {
	try {
		const { reference } = req.body;
		
		if (!reference) {
			return res.status(400).json({ message: 'Reference is required' });
		}

		if (!PAYSTACK_SECRET_KEY) {
			return res.status(500).json({ message: 'Paystack not configured. Please set PAYSTACK_SECRET_KEY in environment variables.' });
		}

		// Verify payment with Paystack using axios
		const response = await axios.get(
			`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
			{
				headers: {
					'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);
		
		if (response.data.status && response.data.data.status === 'success') {
			const { courseId, userId } = response.data.data.metadata;
			
			// Verify the user matches
			if (userId !== req.user.id) {
				return res.status(403).json({ message: 'Unauthorized' });
			}

			// Check if already enrolled
			const existingEnrollment = await Enrollment.findOne({
				user: req.user.id,
				course: courseId
			});

			if (existingEnrollment) {
				return res.json({ 
					message: 'Payment successful, already enrolled!', 
					enrollmentId: existingEnrollment._id,
					payment: response.data.data
				});
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
				payment: response.data.data
			});
		} else {
			res.status(400).json({ 
				message: 'Payment verification failed', 
				details: response.data.message || 'Payment was not successful'
			});
		}

	} catch (error) {
		console.error('Payment verification error:', error);
		res.status(500).json({ 
			message: 'Payment verification failed', 
			error: error.response?.data?.message || error.message 
		});
	}
});

// Paystack webhook endpoint (for production)
router.post('/webhook', async (req, res) => {
	try {
		const event = req.body;
		
		// Verify webhook signature (in production, you should verify the signature)
		// const signature = req.headers['x-paystack-signature'];
		// if (!verifyWebhookSignature(signature, req.body)) {
		//     return res.status(400).json({ message: 'Invalid signature' });
		// }

		if (event.event === 'charge.success') {
			const { reference, metadata } = event.data;
			
			if (metadata && metadata.courseId && metadata.userId) {
				// Check if already enrolled
				const existingEnrollment = await Enrollment.findOne({
					user: metadata.userId,
					course: metadata.courseId
				});

				if (!existingEnrollment) {
					// Create enrollment
					await Enrollment.create({
						user: metadata.userId,
						course: metadata.courseId,
						status: 'active'
					});
					
					console.log(`Enrollment created for user ${metadata.userId} in course ${metadata.courseId}`);
				}
			}
		}

		res.json({ status: 'success' });
	} catch (error) {
		console.error('Webhook error:', error);
		res.status(500).json({ message: 'Webhook processing failed' });
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



