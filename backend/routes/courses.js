const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/course');
const Enrollment = require('../models/Enrollment');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
	res.json({ message: 'Courses API is working!', timestamp: new Date().toISOString() });
});

router.get('/', async (req, res) => {
	try {
		console.log('Fetching courses...');
		console.log('MongoDB connection state:', mongoose.connection.readyState);
		
		// Check if we have a database connection
		if (mongoose.connection.readyState !== 1) {
			console.log('No database connection, returning empty array');
			return res.json([]);
		}
		
		const courses = await Course.find().select('title slug price currency isFree coverImage description');
		console.log(`Found ${courses.length} courses`);
		console.log('Courses data:', courses);
		res.json(courses);
	} catch (error) {
		console.error('Error fetching courses:', error);
		res.status(500).json({ message: 'Error fetching courses', error: error.message });
	}
});

router.get('/:slug', async (req, res) => {
	try {
		console.log(`Fetching course: ${req.params.slug}`);
		const course = await Course.findOne({ slug: req.params.slug });
		if (!course) return res.status(404).json({ message: 'Course not found' });

		// Gate content: return full lessons only if free or user enrolled
		const isFree = course.isFree === true || course.price === 0;
		let canAccess = isFree;
		if (!canAccess && req.headers.authorization) {
			try {
				// soft auth
				const jwt = require('jsonwebtoken');
				const token = req.headers.authorization.startsWith('Bearer ')
					? req.headers.authorization.slice(7)
					: null;
				if (token) {
					const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
					const found = await Enrollment.findOne({ user: payload.id, course: course._id });
					canAccess = Boolean(found);
				}
			} catch (_) { /* ignore soft auth errors */ }
		}

		const safe = course.toObject();
		if (!canAccess) {
			// redact lessons content for locked courses
			safe.lessons = (safe.lessons || []).map((l) => ({ title: l.title, duration: l.duration, order: l.order }));
		}
		res.json(safe);
	} catch (error) {
		console.error('Error fetching course:', error);
		res.status(500).json({ message: 'Error fetching course', error: error.message });
	}
});

router.post('/:id/enroll', async (req, res) => {
	try {
		const courseId = req.params.id;
		const course = await Course.findById(courseId);
		
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		// For free courses, allow enrollment without authentication
		if (course.isFree || course.price === 0) {
			// Create a temporary enrollment record for free courses
			const enrollment = {
				_id: `temp_${Date.now()}`,
				course: courseId,
				user: 'anonymous',
				status: 'active',
				enrolledAt: new Date(),
				progress: 0
			};
			
			return res.status(201).json({
				message: 'Successfully enrolled in free course!',
				enrollment: enrollment,
				redirect: '/portal'
			});
		}

		// For paid courses, require authentication
		if (!req.headers.authorization) {
			return res.status(401).json({ message: 'Authentication required for paid courses' });
		}

		// Verify JWT token
		const jwt = require('jsonwebtoken');
		const token = req.headers.authorization.startsWith('Bearer ')
			? req.headers.authorization.slice(7)
			: null;
		
		if (!token) {
			return res.status(401).json({ message: 'Invalid token format' });
		}

		const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
		const userId = payload.id;

		// Check if already enrolled
		const existing = await Enrollment.findOne({ user: userId, course: courseId });
		if (existing) {
			return res.status(200).json({
				message: 'Already enrolled in this course',
				enrollment: existing
			});
		}
		
		// Create enrollment record
		const enrollment = await Enrollment.create({ 
			user: userId, 
			course: courseId, 
			status: 'active',
			enrolledAt: new Date(),
			progress: 0
		});

		// Populate course data for response
		await enrollment.populate('course', 'title slug coverImage price currency description');
		
		res.status(201).json({
			message: 'Successfully enrolled in course!',
			enrollment: enrollment
		});
	} catch (error) {
		console.error('Error enrolling in course:', error);
		res.status(500).json({ message: 'Error enrolling in course', error: error.message });
	}
});

module.exports = router;



