const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/course');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
	const enrollments = await Enrollment.find({ user: req.user.id })
		.populate('course', 'title slug coverImage price currency')
		.lean();
	res.json(enrollments);
});

router.post('/:id/progress', requireAuth, async (req, res) => {
	const { lessonId } = req.body || {};
	const enrollment = await Enrollment.findById(req.params.id);
	if (!enrollment || String(enrollment.user) !== req.user.id) {
		return res.status(404).json({ message: 'Not found' });
	}
	enrollment.progress = enrollment.progress || [];
	enrollment.progress.push({ lessonId, completedAt: new Date() });
	await enrollment.save();
	res.json(enrollment);
});

module.exports = router;


