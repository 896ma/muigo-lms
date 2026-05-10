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
		console.log('GET /api/courses - Request received');
		console.log('Request headers:', req.headers);
		console.log('Request origin:', req.headers.origin);
		
		// Check if we have a database connection
		console.log('Database connection state:', mongoose.connection.readyState);
		if (mongoose.connection.readyState !== 1) {
			console.log('Database not connected, returning empty array');
			return res.json([]);
		}
		
		console.log('Fetching courses from database...');
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

router.post('/:id/enroll', async (req, res) => {
	try {
		const courseId = req.params.id;
		const course = await Course.findById(courseId);
		
		if (!course) {
			return res.status(404).json({ message: 'Course not found' });
		}

		// For free courses, allow enrollment without authentication
		if (course.isFree || course.price === 0) {
			// If user is authenticated, create a real enrollment record
			if (req.headers.authorization) {
				try {
					const jwt = require('jsonwebtoken');
					const token = req.headers.authorization.startsWith('Bearer ')
						? req.headers.authorization.slice(7)
						: null;
					
					if (token) {
						const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
						
						// Check if user is an admin - admins cannot enroll in courses
						if (payload.role === 'admin') {
							return res.status(403).json({ 
								message: 'Administrators cannot enroll in courses. Please use a farmer account to enroll.' 
							});
						}
						
						const mongoose = require('mongoose');
						const userId = new mongoose.Types.ObjectId(payload.id);

						// Check if already enrolled
						const existing = await Enrollment.findOne({ user: userId, course: courseId });
						if (existing) {
							return res.status(200).json({
								message: 'Already enrolled in this course',
								enrollment: existing
							});
						}
						
						// Create real enrollment record
						console.log('Creating enrollment for user:', userId, 'course:', courseId);
						const enrollment = await Enrollment.create({ 
							user: userId, 
							course: courseId, 
							status: 'active',
							enrolledAt: new Date(),
							progress: 0
						});
						console.log('Enrollment created:', enrollment._id);

						// Populate course data for response
						await enrollment.populate('course', 'title slug coverImage price currency description');
						console.log('Enrollment populated:', enrollment);
						
						return res.status(201).json({
							message: 'Successfully enrolled in free course!',
							enrollment: enrollment
						});
					}
				} catch (err) {
					console.error('Auth error for free course:', err);
					// Fall through to anonymous enrollment
				}
			}
			
			// Create a temporary enrollment record for anonymous users
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
		
		// Check if user is an admin - admins cannot enroll in courses
		if (payload.role === 'admin') {
			return res.status(403).json({ 
				message: 'Administrators cannot enroll in courses. Please use a farmer account to enroll.' 
			});
		}
		
		const mongoose = require('mongoose');
		const userId = new mongoose.Types.ObjectId(payload.id);

		// Check if already enrolled
		const existing = await Enrollment.findOne({ user: userId, course: courseId });
		if (existing) {
			return res.status(200).json({
				message: 'Already enrolled in this course',
				enrollment: existing
			});
		}
		
		// Create enrollment record
		console.log('Creating paid course enrollment for user:', userId, 'course:', courseId);
		const enrollment = await Enrollment.create({ 
			user: userId, 
			course: courseId, 
			status: 'active',
			enrolledAt: new Date(),
			progress: 0
		});
		console.log('Paid course enrollment created:', enrollment._id);

		// Populate course data for response
		await enrollment.populate('course', 'title slug coverImage price currency description');
		console.log('Paid course enrollment populated:', enrollment);
		
		res.status(201).json({
			message: 'Successfully enrolled in course!',
			enrollment: enrollment
		});
	} catch (error) {
		console.error('Error enrolling in course:', error);
		res.status(500).json({ message: 'Error enrolling in course', error: error.message });
	}
});

// GET /api/courses/:id/quiz — returns questions without answers (requires enrollment for paid courses)
router.get('/:id/quiz', async (req, res) => {
	try {
		const course = await Course.findById(req.params.id);
		if (!course) return res.status(404).json({ message: 'Course not found' });

		// Collect all quiz questions from quiz lessons
		const quizLessons = (course.lessons || []).filter(l => l.isQuiz && l.quiz && l.quiz.questions && l.quiz.questions.length > 0);
		if (quizLessons.length === 0) return res.status(404).json({ message: 'No quiz available for this course' });

		const isFree = course.isFree === true || course.price === 0;
		let canAccess = isFree;

		if (!canAccess && req.headers.authorization) {
			try {
				const jwt = require('jsonwebtoken');
				const token = req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
				if (token) {
					const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
					const found = await Enrollment.findOne({ user: payload.id, course: course._id });
					canAccess = Boolean(found);
				}
			} catch (_) {}
		}

		if (!canAccess) return res.status(403).json({ message: 'Enrollment required to access quiz' });

		// Return questions without the answer field
		const questions = quizLessons.flatMap(l =>
			l.quiz.questions.map((q, i) => ({
				id: `${l._id}_${i}`,
				question: q.question,
				options: q.options
			}))
		);

		res.json({ courseId: course._id, title: course.title, questions });
	} catch (error) {
		console.error('Error fetching quiz:', error);
		res.status(500).json({ message: 'Error fetching quiz', error: error.message });
	}
});

// POST /api/courses/:id/quiz/submit — grades the quiz and returns results with correct answers for wrong ones
router.post('/:id/quiz/submit', async (req, res) => {
	try {
		const course = await Course.findById(req.params.id);
		if (!course) return res.status(404).json({ message: 'Course not found' });

		const isFree = course.isFree === true || course.price === 0;
		let canAccess = isFree;

		if (!canAccess && req.headers.authorization) {
			try {
				const jwt = require('jsonwebtoken');
				const token = req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
				if (token) {
					const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
					const found = await Enrollment.findOne({ user: payload.id, course: course._id });
					canAccess = Boolean(found);
				}
			} catch (_) {}
		}

		if (!canAccess) return res.status(403).json({ message: 'Enrollment required to submit quiz' });

		const { answers } = req.body; // { [questionId]: selectedOptionIndex }
		if (!answers) return res.status(400).json({ message: 'Answers are required' });

		const quizLessons = (course.lessons || []).filter(l => l.isQuiz && l.quiz && l.quiz.questions && l.quiz.questions.length > 0);
		const allQuestions = quizLessons.flatMap(l =>
			l.quiz.questions.map((q, i) => ({ id: `${l._id}_${i}`, question: q.question, options: q.options, answer: q.answer }))
		);

		let correct = 0;
		const results = allQuestions.map(q => {
			const userAnswer = answers[q.id];
			const isCorrect = parseInt(userAnswer) === q.answer;
			if (isCorrect) correct++;
			return {
				id: q.id,
				question: q.question,
				options: q.options,
				userAnswer: userAnswer !== undefined ? parseInt(userAnswer) : null,
				correctAnswer: q.answer,
				isCorrect
			};
		});

		const total = allQuestions.length;
		const score = total > 0 ? Math.round((correct / total) * 100) : 0;
		const passed = score >= 70;

		res.json({ score, correct, total, passed, results });
	} catch (error) {
		console.error('Error submitting quiz:', error);
		res.status(500).json({ message: 'Error submitting quiz', error: error.message });
	}
});

module.exports = router;



