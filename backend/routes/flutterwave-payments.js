const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/course');
const requireAuth = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Flutterwave configuration
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || 'FLWSECK_TEST-1234567890abcdef'; // Replace with real key
const FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-1234567890abcdef'; // Replace with real key
const FLUTTERWAVE_BASE_URL = 'https://api.flutterwave.com/v3';

router.get('/health', (req, res) => {
	res.json({ status: 'ok', provider: 'flutterwave' });
});

// Initialize Flutterwave M-Pesa payment
router.post('/initialize', async (req, res) => {
	try {
		console.log('Flutterwave M-Pesa payment request:', req.body);
		const { courseId, phoneNumber } = req.body;
		
		if (!courseId) {
			return res.status(400).json({ message: 'Course ID is required' });
		}

		if (!phoneNumber) {
			return res.status(400).json({ message: 'Phone number is required for M-Pesa payment' });
		}

		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		if (course.isFree || course.price === 0) {
			return res.status(400).json({ message: 'Course is free' });
		}

		// Format phone number for M-Pesa (254XXXXXXXXX)
		let formattedPhone = phoneNumber.replace(/\D/g, '');
		if (formattedPhone.startsWith('0')) {
			formattedPhone = '254' + formattedPhone.substring(1);
		} else if (formattedPhone.startsWith('7')) {
			formattedPhone = '254' + formattedPhone;
		} else if (!formattedPhone.startsWith('254')) {
			formattedPhone = '254' + formattedPhone;
		}

		// Generate unique reference
		const reference = `course_${course._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

		// Flutterwave M-Pesa payment data
		const paymentData = {
			tx_ref: reference,
			amount: course.price,
			currency: 'KES',
			redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:5175'}/payment-callback`,
			payment_options: 'mpesa',
			customer: {
				email: `user_${Date.now()}@temp.com`,
				phonenumber: formattedPhone,
				name: 'Course Student'
			},
			customizations: {
				title: 'Farmers LMS',
				description: `Payment for ${course.title}`,
				logo: 'https://via.placeholder.com/150'
			},
			meta: {
				courseId: course._id.toString(),
				userId: req.user?.id || 'anonymous',
				courseTitle: course.title
			}
		};

		console.log('Sending Flutterwave M-Pesa payment data:', paymentData);
		
		const response = await axios.post(
			`${FLUTTERWAVE_BASE_URL}/payments`,
			paymentData,
			{
				headers: {
					'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);
		
		console.log('Flutterwave M-Pesa response:', response.data);
		
		if (response.data.status === 'success') {
			res.json({
				status: 'success',
				message: 'M-Pesa payment prompt sent to your phone. Please check your phone to complete payment.',
				payment_url: response.data.data.link,
				reference: reference,
				phone_number: formattedPhone,
				amount: course.price,
				currency: 'KES'
			});
		} else {
			throw new Error(response.data.message || 'M-Pesa payment initialization failed');
		}

	} catch (error) {
		console.error('Flutterwave M-Pesa initialization error:', error);
		res.status(500).json({ 
			message: 'M-Pesa payment initialization failed', 
			error: error.response?.data?.message || error.message,
			details: error.response?.data
		});
	}
});

// Verify Flutterwave payment
router.post('/verify', async (req, res) => {
	try {
		const { reference } = req.body;
		
		if (!reference) {
			return res.status(400).json({ message: 'Reference is required' });
		}

		// Verify payment with Flutterwave
		const response = await axios.get(
			`${FLUTTERWAVE_BASE_URL}/transactions/${reference}/verify`,
			{
				headers: {
					'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
					'Content-Type': 'application/json'
				}
			}
		);
		
		console.log('Flutterwave payment verification response:', response.data);
		
		if (response.data.status === 'success' && response.data.data.status === 'successful') {
			const { courseId, userId } = response.data.data.meta;
			
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
		} else if (response.data.data.status === 'pending') {
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

module.exports = router;
