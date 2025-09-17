const express = require('express');
const User = require('../models/user');
const Course = require('../models/course');
const Enrollment = require('../models/Enrollment');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

// Get dashboard statistics
router.get('/stats', requireAuth, async (req, res) => {
	try {
		const totalUsers = await User.countDocuments();
		const totalCourses = await Course.countDocuments();
		const totalEnrollments = await Enrollment.countDocuments();
		const activeUsers = await User.countDocuments({ role: { $ne: 'admin' } });
		
		res.json({
			totalUsers,
			totalCourses,
			totalEnrollments,
			activeUsers
		});
	} catch (error) {
		console.error('Error fetching admin stats:', error);
		res.status(500).json({ message: 'Error fetching statistics' });
	}
});

// Get all users
router.get('/users', requireAuth, async (req, res) => {
	try {
		const users = await User.find({}, 'name email phone farmLocation role createdAt').sort({ createdAt: -1 });
		res.json(users);
	} catch (error) {
		console.error('Error fetching users:', error);
		res.status(500).json({ message: 'Error fetching users' });
	}
});

module.exports = router;



