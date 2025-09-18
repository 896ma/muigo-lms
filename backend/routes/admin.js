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

// Get single user
router.get('/users/:id', requireAuth, async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-passwordHash');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.json(user);
	} catch (error) {
		console.error('Error fetching user:', error);
		res.status(500).json({ message: 'Error fetching user' });
	}
});

// Create new user
router.post('/users', requireAuth, async (req, res) => {
	try {
		const { name, email, phone, farmLocation, role = 'farmer' } = req.body;
		
		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User with this email already exists' });
		}

		// Create new user (without password for admin creation)
		const user = new User({
			name,
			email,
			phone,
			farmLocation,
			role
		});

		await user.save();
		res.status(201).json({ message: 'User created successfully', user });
	} catch (error) {
		console.error('Error creating user:', error);
		res.status(500).json({ message: 'Error creating user', error: error.message });
	}
});

// Update user
router.put('/users/:id', requireAuth, async (req, res) => {
	try {
		const { name, email, phone, farmLocation, role } = req.body;
		
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Check if email is being changed and if it already exists
		if (email && email !== user.email) {
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				return res.status(400).json({ message: 'User with this email already exists' });
			}
		}

		// Update user fields
		if (name) user.name = name;
		if (email) user.email = email;
		if (phone) user.phone = phone;
		if (farmLocation) user.farmLocation = farmLocation;
		if (role) user.role = role;

		await user.save();
		res.json({ message: 'User updated successfully', user });
	} catch (error) {
		console.error('Error updating user:', error);
		res.status(500).json({ message: 'Error updating user', error: error.message });
	}
});

// Delete user
router.delete('/users/:id', requireAuth, async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Don't allow deleting admin users
		if (user.role === 'admin') {
			return res.status(400).json({ message: 'Cannot delete admin users' });
		}

		await User.findByIdAndDelete(req.params.id);
		res.json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('Error deleting user:', error);
		res.status(500).json({ message: 'Error deleting user', error: error.message });
	}
});

// Get all courses for admin
router.get('/courses', requireAuth, async (req, res) => {
	try {
		const courses = await Course.find().sort({ createdAt: -1 });
		res.json(courses);
	} catch (error) {
		console.error('Error fetching courses:', error);
		res.status(500).json({ message: 'Error fetching courses' });
	}
});

// Get single course for admin
router.get('/courses/:id', requireAuth, async (req, res) => {
	try {
		const course = await Course.findById(req.params.id);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}
		res.json(course);
	} catch (error) {
		console.error('Error fetching course:', error);
		res.status(500).json({ message: 'Error fetching course' });
	}
});

// Create new course
router.post('/courses', requireAuth, async (req, res) => {
	try {
		const { title, description, category, coverImage, price, currency = 'KES', isFree, lessons } = req.body;
		
		// Generate slug from title
		const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
		
		// Check if course with same slug exists
		const existingCourse = await Course.findOne({ slug });
		if (existingCourse) {
			return res.status(400).json({ message: 'Course with this title already exists' });
		}

		const course = new Course({
			title,
			slug,
			description,
			category,
			coverImage,
			price: price || 0,
			currency,
			isFree: isFree || false,
			lessons: lessons || [],
			createdBy: req.user.id
		});

		await course.save();
		res.status(201).json({ message: 'Course created successfully', course });
	} catch (error) {
		console.error('Error creating course:', error);
		res.status(500).json({ message: 'Error creating course', error: error.message });
	}
});

// Update course
router.put('/courses/:id', requireAuth, async (req, res) => {
	try {
		const { title, description, category, coverImage, price, currency, isFree, lessons } = req.body;
		
		const course = await Course.findById(req.params.id);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		// Update course fields
		if (title) {
			course.title = title;
			// Update slug if title changed
			course.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
		}
		if (description) course.description = description;
		if (category) course.category = category;
		if (coverImage) course.coverImage = coverImage;
		if (price !== undefined) course.price = price;
		if (currency) course.currency = currency;
		if (isFree !== undefined) course.isFree = isFree;
		if (lessons) course.lessons = lessons;

		await course.save();
		res.json({ message: 'Course updated successfully', course });
	} catch (error) {
		console.error('Error updating course:', error);
		res.status(500).json({ message: 'Error updating course', error: error.message });
	}
});

// Delete course
router.delete('/courses/:id', requireAuth, async (req, res) => {
	try {
		const course = await Course.findById(req.params.id);
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		// Check if course has enrollments
		const enrollments = await Enrollment.find({ course: req.params.id });
		if (enrollments.length > 0) {
			return res.status(400).json({ 
				message: 'Cannot delete course with existing enrollments', 
				enrollmentCount: enrollments.length 
			});
		}

		await Course.findByIdAndDelete(req.params.id);
		res.json({ message: 'Course deleted successfully' });
	} catch (error) {
		console.error('Error deleting course:', error);
		res.status(500).json({ message: 'Error deleting course', error: error.message });
	}
});

module.exports = router;



