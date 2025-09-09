const express = require('express');
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
		const courses = await Course.find().select('title slug price currency isFree coverImage description');
		console.log(`Found ${courses.length} courses`);
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

router.post('/:id/enroll', requireAuth, async (req, res) => {
	try {
		const courseId = req.params.id;
		const existing = await Enrollment.findOne({ user: req.user.id, course: courseId });
		if (existing) return res.json(existing);
		const enrollment = await Enrollment.create({ user: req.user.id, course: courseId, status: 'active' });
		res.status(201).json(enrollment);
	} catch (error) {
		console.error('Error enrolling in course:', error);
		res.status(500).json({ message: 'Error enrolling in course', error: error.message });
	}
});

module.exports = router;



