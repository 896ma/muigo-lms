const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/course');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Test endpoint to check all enrollments
router.get('/test', async (req, res) => {
	try {
		const enrollments = await Enrollment.find()
			.populate('course', 'title slug')
			.populate('user', 'name email')
			.lean();
		res.json({ 
			message: 'All enrollments', 
			count: enrollments.length, 
			enrollments: enrollments 
		});
	} catch (error) {
		console.error('Error fetching all enrollments:', error);
		res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
	}
});

router.get('/me', requireAuth, async (req, res) => {
	try {
		const mongoose = require('mongoose');
		const userId = new mongoose.Types.ObjectId(req.user.id);
		
		const enrollments = await Enrollment.find({ user: userId })
			.populate('course', 'title slug coverImage price currency description')
			.lean();
		res.json(enrollments);
	} catch (error) {
		console.error('Error fetching enrollments:', error);
		res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
	}
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


