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

// Update progress for a specific enrollment
router.put('/:id/progress', requireAuth, async (req, res) => {
	try {
		const { progress, completedLessons } = req.body;
		const enrollment = await Enrollment.findById(req.params.id);
		
		if (!enrollment || String(enrollment.user) !== req.user.id) {
			return res.status(404).json({ message: 'Enrollment not found' });
		}

		// Update progress percentage
		if (progress !== undefined) {
			enrollment.progress = Math.min(100, Math.max(0, progress));
		}

		// Update completed lessons
		if (completedLessons) {
			enrollment.completedLessons = completedLessons;
		}

		// Mark as completed if progress is 100%
		if (enrollment.progress >= 100) {
			enrollment.completed = true;
			enrollment.completedAt = new Date();
		}

		await enrollment.save();
		res.json({ 
			message: 'Progress updated successfully', 
			enrollment: {
				_id: enrollment._id,
				progress: enrollment.progress,
				completed: enrollment.completed,
				completedLessons: enrollment.completedLessons
			}
		});
	} catch (error) {
		console.error('Error updating progress:', error);
		res.status(500).json({ message: 'Error updating progress', error: error.message });
	}
});

// Mark lesson as completed
router.post('/:id/lessons/:lessonId/complete', requireAuth, async (req, res) => {
	try {
		const { lessonId } = req.params;
		const enrollment = await Enrollment.findById(req.params.id);
		
		if (!enrollment || String(enrollment.user) !== req.user.id) {
			return res.status(404).json({ message: 'Enrollment not found' });
		}

		// Get course to calculate total lessons
		const course = await Course.findById(enrollment.course);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		const totalLessons = course.lessons ? course.lessons.length : 1;
		
		// Initialize completed lessons array if not exists
		if (!enrollment.completedLessons) {
			enrollment.completedLessons = [];
		}

		// Add lesson to completed lessons if not already completed
		if (!enrollment.completedLessons.includes(lessonId)) {
			enrollment.completedLessons.push(lessonId);
		}

		// Calculate progress percentage
		enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);

		// Mark as completed if all lessons are done
		if (enrollment.progress >= 100) {
			enrollment.completed = true;
			enrollment.completedAt = new Date();
		}

		await enrollment.save();
		res.json({ 
			message: 'Lesson marked as completed', 
			progress: enrollment.progress,
			completed: enrollment.completed,
			completedLessons: enrollment.completedLessons.length,
			totalLessons
		});
	} catch (error) {
		console.error('Error marking lesson as completed:', error);
		res.status(500).json({ message: 'Error marking lesson as completed', error: error.message });
	}
});

// Get detailed progress for a specific enrollment
router.get('/:id/progress', requireAuth, async (req, res) => {
	try {
		const enrollment = await Enrollment.findById(req.params.id)
			.populate('course', 'title slug lessons');
		
		if (!enrollment || String(enrollment.user) !== req.user.id) {
			return res.status(404).json({ message: 'Enrollment not found' });
		}

		const course = enrollment.course;
		const totalLessons = course.lessons ? course.lessons.length : 0;
		const completedLessons = enrollment.completedLessons ? enrollment.completedLessons.length : 0;
		const progress = enrollment.progress || 0;

		res.json({
			enrollment: {
				_id: enrollment._id,
				progress,
				completed: enrollment.completed,
				completedLessons,
				totalLessons,
				enrolledAt: enrollment.enrolledAt,
				completedAt: enrollment.completedAt
			},
			course: {
				title: course.title,
				slug: course.slug,
				lessons: course.lessons || []
			}
		});
	} catch (error) {
		console.error('Error fetching progress:', error);
		res.status(500).json({ message: 'Error fetching progress', error: error.message });
	}
});

module.exports = router;


