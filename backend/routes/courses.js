const express = require('express');
const Course = require('../models/course');
const Enrollment = require('../models/Enrollment');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
	const courses = await Course.find().select('title slug price currency isFree coverImage');
	res.json(courses);
});

router.get('/:slug', async (req, res) => {
	const course = await Course.findOne({ slug: req.params.slug });
	if (!course) return res.status(404).json({ message: 'Not found' });
	res.json(course);
});

router.post('/:id/enroll', requireAuth, async (req, res) => {
	const courseId = req.params.id;
	const existing = await Enrollment.findOne({ user: req.user.id, course: courseId });
	if (existing) return res.json(existing);
	const enrollment = await Enrollment.create({ user: req.user.id, course: courseId, status: 'active' });
	res.status(201).json(enrollment);
});

module.exports = router;



