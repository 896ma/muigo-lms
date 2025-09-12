const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/course');
const requireAuth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Paystack configuration - using environment variables
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

router.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Test Paystack configuration
router.get('/test-paystack', async (req, res) => {
	try {
		console.log('Testing Paystack configuration...');
		console.log('Secret Key (first 10 chars):', PAYSTACK_SECRET_KEY ? PAYSTACK_SECRET_KEY.substring(0, 10) + '...' : 'Not set');
		
		// Test Paystack API connectivity
		const response = await axios.get(
			`${PAYSTACK_BASE_URL}/bank`,
			{
				headers: {
					'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);
		
		res.json({
			status: 'success',
			message: 'Paystack API is accessible',
			paystack_response: response.data,
			secret_key_configured: !!PAYSTACK_SECRET_KEY
		});
	} catch (error) {
		console.error('Paystack test error:', error.response?.data || error.message);
		res.status(500).json({
			status: 'error',
			message: 'Paystack API test failed',
			error: error.response?.data || error.message,
			secret_key_configured: !!PAYSTACK_SECRET_KEY
		});
	}
});

// Initialize Paystack payment with M-Pesa
router.post('/initialize', async (req, res) => {
	try {
		console.log('Payment initialization request:', req.body);
		const { courseId, phoneNumber } = req.body;
		
		if (!courseId) {
			return res.status(400).json({ message: 'Course ID is required' });
		}

		if (!phoneNumber) {
			return res.status(400).json({ message: 'Phone number is required for M-Pesa payment' });
		}

		console.log('Paystack Secret Key:', PAYSTACK_SECRET_KEY ? 'Set' : 'Not set');
		console.log('Paystack Secret Key (first 10 chars):', PAYSTACK_SECRET_KEY ? PAYSTACK_SECRET_KEY.substring(0, 10) + '...' : 'Not set');
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

		// Generate unique reference
		const reference = `course_${course._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Format phone number for M-Pesa (ensure it starts with 254)
		let formattedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
		if (formattedPhone.startsWith('0')) {
			formattedPhone = '254' + formattedPhone.substring(1);
		} else if (formattedPhone.startsWith('7')) {
			formattedPhone = '254' + formattedPhone;
		} else if (!formattedPhone.startsWith('254')) {
			formattedPhone = '254' + formattedPhone;
		}

		// Initialize Paystack payment with M-Pesa using mobile money object
		const paymentData = {
			email: `user_${Date.now()}@temp.com`, // Generate temporary email for Paystack
			amount: course.price * 100, // Paystack expects amount in kobo (smallest currency unit)
			currency: course.currency || 'KES',
			reference: reference,
			channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'], // Allow multiple channels including mobile_money
			mobile_money: {
				phone: formattedPhone,
				provider: 'mpesa'
			},
			metadata: {
				courseId: course._id.toString(),
				userId: req.user?.id || 'anonymous',
				courseTitle: course.title,
				phoneNumber: formattedPhone
			},
			callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5175'}/payment-callback`
		};

		console.log('Sending M-Pesa payment data to Paystack:', paymentData);
		
		// For M-Pesa, we need to use a different approach
		// Since M-Pesa requires authorization, we'll use the initialize API with proper M-Pesa configuration
		let response;
		
		try {
			// Create M-Pesa specific payment data
			const mpesaPaymentData = {
				email: paymentData.email,
				amount: paymentData.amount,
				currency: paymentData.currency,
				reference: paymentData.reference,
				channels: ['mobile_money'], // Only mobile money channels
				mobile_money: {
					phone: formattedPhone,
					provider: 'mpesa'
				},
				metadata: paymentData.metadata,
				callback_url: paymentData.callback_url
			};

			console.log('Sending M-Pesa payment to Paystack:', mpesaPaymentData);

			// Use initialize API with M-Pesa configuration
			response = await axios.post(
				`${PAYSTACK_BASE_URL}/transaction/initialize`,
				mpesaPaymentData,
				{
					headers: {
						'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
						'Content-Type': 'application/json'
					}
				}
			);
			
			console.log('M-Pesa initialize response:', response.data);
			
			// If initialization is successful, we need to trigger the M-Pesa prompt
			if (response.data.status && response.data.data.authorization_url) {
				// For M-Pesa, we need to redirect to the authorization URL
				// This will open a page where the user can complete the M-Pesa payment
				console.log('M-Pesa authorization URL generated:', response.data.data.authorization_url);
			}
			
		} catch (error) {
			console.error('M-Pesa initialization error:', error.response?.data);
			throw new Error(error.response?.data?.message || 'M-Pesa payment initialization failed');
		}
		
		console.log('Paystack M-Pesa response status:', response.status);
		console.log('Paystack M-Pesa response data:', response.data);
		
		if (response.data.status) {
			// M-Pesa payment initialized successfully
			const paymentResponse = {
				authorization_url: response.data.data.authorization_url,
				access_code: response.data.data.access_code,
				reference: response.data.data.reference,
				payment_type: 'mpesa',
				amount: course.price,
				currency: course.currency || 'KES',
				phone_number: formattedPhone,
				message: `M-Pesa payment initialized. Please click the authorization URL to complete payment on your phone.`,
				mpesa_prompt: true,
				redirect_url: response.data.data.authorization_url
			};

			res.json(paymentResponse);
		} else {
			throw new Error(response.data.message || 'M-Pesa payment initialization failed');
		}

	} catch (error) {
		console.error('Paystack M-Pesa initialization error:', error);
		console.error('Error response:', error.response?.data);
		console.error('Error status:', error.response?.status);
		res.status(500).json({ 
			message: 'M-Pesa payment initialization failed', 
			error: error.response?.data?.message || error.message,
			details: error.response?.data
		});
	}
});

// Verify Paystack payment and enroll user
router.post('/verify', async (req, res) => {
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
		
		console.log('Payment verification response:', response.data);
		
		if (response.data.status && response.data.data.status === 'success') {
			const { courseId, userId } = response.data.data.metadata;
			
			// For testing purposes, allow verification without strict user matching
			if (req.user && userId && userId !== req.user.id) {
				return res.status(403).json({ message: 'Unauthorized' });
			}

			// Get the course to verify it exists
			const course = await Course.findById(courseId);
			if (!course) {
				return res.status(404).json({ message: 'Course not found' });
			}

			// Create real enrollment record for successful M-Pesa payment
			const mongoose = require('mongoose');
			const userObjectId = new mongoose.Types.ObjectId(userId);
			
			// Check if already enrolled
			const existingEnrollment = await Enrollment.findOne({
				user: userObjectId,
				course: courseId
			});

			if (existingEnrollment) {
				return res.json({ 
					message: 'M-Pesa payment successful! You are already enrolled in this course.', 
					enrollmentId: existingEnrollment._id,
					payment: response.data.data,
					course: {
						title: course.title,
						price: course.price
					}
				});
			}

			// Create new enrollment
			const enrollment = await Enrollment.create({
				user: userObjectId,
				course: courseId,
				status: 'active',
				enrolledAt: new Date(),
				progress: 0
			});

			console.log('M-Pesa payment successful, enrollment created:', enrollment._id);

			res.json({ 
				message: 'M-Pesa payment successful! You are now enrolled in the course.', 
				enrollmentId: enrollment._id,
				payment: response.data.data,
				course: {
					title: course.title,
					price: course.price
				}
			});
		} else if (response.data.status && response.data.data.status === 'pending') {
			// Payment is still pending
			res.json({ 
				message: 'Payment is still pending. Please complete the payment on your phone.', 
				status: 'pending',
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



