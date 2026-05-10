import { StrictMode, useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useParams, useNavigate, Link } from 'react-router-dom'
import './index.css'
import AppLayout from './App.jsx'
import { apiGet, API_BASE_URL } from './lib/api.js'

const getApiBaseUrl = () => {
	return API_BASE_URL
};

const Section = ({ title, children }) => (
	<section className="space-y-4">
		<h2 className="text-2xl font-semibold text-jungle flex items-center gap-2">
			<span className="h-2 w-2 rounded-full bg-jungle-400" />
			{title}
		</h2>
		<div className="text-gray-700">{children}</div>
	</section>
)


export { Section }

const heroSlides = [
	'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1600&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=1600&auto=format&fit=crop',
	'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=1600&auto=format&fit=crop',
]

const Home = () => {
	const [activeSlide, setActiveSlide] = useState(0)

	useEffect(() => {
		const timer = setInterval(() => {
			setActiveSlide((prev) => (prev + 1) % heroSlides.length)
		}, 4500)
		return () => clearInterval(timer)
	}, [])

	return (
		<div className="space-y-10">
			<div className="grid gap-6 lg:grid-cols-2 animate-[fadein_0.6s_ease-out]">
				<div className="rounded-2xl border border-jungle-700 bg-gradient-to-br from-jungle-800 to-jungle-900 text-white p-7 shadow-xl shadow-jungle-900/20">
					<img src="/mfarm-logo.svg" alt="M-Farm logo" className="h-14 w-auto rounded-md bg-white p-1" />
					<p className="mt-4 text-xs tracking-[0.25em] text-jungle-200 uppercase">Smart Farming Learning</p>
					<h1 className="mt-3 text-3xl font-bold leading-tight">Welcome to M-Farm LMS</h1>
					<p className="mt-3 text-jungle-50">Learn, grow, and thrive with free and premium courses designed for real farm outcomes.</p>
					<div className="mt-6 flex gap-3">
						<Link className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-white text-jungle hover:bg-jungle-50 hover:scale-105 transition-transform" to="/courses">Browse Courses</Link>
						<Link className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium border border-white text-white hover:bg-jungle-600 hover:scale-105 transition-transform" to="/register">Get Started</Link>
					</div>
				</div>
				<div className="relative overflow-hidden rounded-2xl border border-jungle-700 min-h-[260px]">
					<img
						key={heroSlides[activeSlide]}
						src={heroSlides[activeSlide]}
						alt="Farmers hero slide"
						className="absolute inset-0 h-full w-full object-cover transition-all duration-700 scale-105 hover:scale-110"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
				</div>
			</div>
			<Section title="Popular Courses">
				<CourseGrid variant="mosaic" />
			</Section>
		</div>
	)
}

export { Home }

const Courses = () => (
	<div className="space-y-6">
		<Section title="All Courses">
			<CourseGrid variant="mosaic" />
		</Section>
	</div>
)

export { Courses }

const Login = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: '',
		password: ''
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setMessage('');

		try {
			const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData)
			});

			const data = await response.json();

			if (response.ok) {
				setMessage('Login successful!');
				// Store token and user data in localStorage
				localStorage.setItem('token', data.token);
				localStorage.setItem('user', JSON.stringify(data.user));
				// Redirect to appropriate page based on role
				if (data.user.role === 'admin') {
					navigate('/admin');
				} else {
					navigate('/portal');
				}
			} else {
				setError(data.message || 'Login failed');
			}
		} catch (error) {
			console.error('Login error:', error);
			setError('Network error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Section title="Login">
			<p className="text-gray-300">Sign in to access your account.</p>
			
			{message && (
				<div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
					{message}
				</div>
			)}
			
			{error && (
				<div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="mt-4 grid gap-3 max-w-md rounded-xl border border-jungle-700/40 bg-jungle-900/30 p-5">
				<input 
					className="border border-jungle-400/50 bg-black/20 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jungle-400" 
					placeholder="Email" 
					type="email" 
					name="email"
					value={formData.email}
					onChange={handleChange}
					required
				/>
				<input 
					className="border border-jungle-400/50 bg-black/20 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jungle-400" 
					placeholder="Password" 
					type="password" 
					name="password"
					value={formData.password}
					onChange={handleChange}
					required
				/>
				<button 
					type="submit" 
					disabled={loading}
					className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle-500 text-white hover:bg-jungle-600 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Logging in...' : 'Login'}
				</button>
			</form>
		</Section>
	)
}

const Register = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		phone: '',
		farmLocation: ''
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (!formData.name.trim()) return setError('Full name is required.');
		if (!formData.email.trim()) return setError('Email is required.');
		if (!formData.password || formData.password.length < 6) return setError('Password must be at least 6 characters.');
		setLoading(true);
		setMessage('');

		try {
			const response = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData)
			});

			const data = await response.json();

			if (response.ok) {
				setMessage('Registration successful! You can now log in.');
				setFormData({ name: '', email: '', password: '', phone: '', farmLocation: '' });
				// Store token in localStorage
				localStorage.setItem('token', data.token);
				localStorage.setItem('user', JSON.stringify(data.user));
			} else {
				setError(data.message || 'Registration failed');
			}
		} catch {
			setError('Network error. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Section title="Register">
			<p className="text-gray-300">Create your account to access your learning dashboard.</p>
			
			{message && (
				<div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
					{message}
				</div>
			)}
			
			{error && (
				<div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit} className="mt-4 grid gap-3 max-w-md rounded-xl border border-jungle-700/40 bg-jungle-900/30 p-5">
				<input 
					className="border border-jungle-400/50 bg-black/20 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jungle-400" 
					placeholder="Full Name" 
					name="name"
					value={formData.name}
					onChange={handleChange}
					required
				/>
				<input 
					className="border border-jungle-400/50 bg-black/20 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jungle-400" 
					placeholder="Email" 
					type="email" 
					name="email"
					value={formData.email}
					onChange={handleChange}
					required
				/>
				<input 
					className="border border-jungle-400/50 bg-black/20 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jungle-400" 
					placeholder="Password (min 6 characters)" 
					type="password" 
					name="password"
					value={formData.password}
					onChange={handleChange}
					required
					minLength="6"
				/>
				<input 
					className="border border-jungle-400/50 bg-black/20 text-white rounded px-3 py-2" 
					placeholder="Phone Number (optional)" 
					type="tel"
					name="phone"
					value={formData.phone}
					onChange={handleChange}
				/>
				<input 
					className="border border-jungle-400/50 bg-black/20 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jungle-400" 
					placeholder="Shop Location (optional)" 
					type="text"
					name="farmLocation"
					value={formData.farmLocation}
					onChange={handleChange}
				/>
				<button 
					type="submit" 
					disabled={loading}
					className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle-500 text-white hover:bg-jungle-600 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{loading ? 'Registering...' : 'Register'}
				</button>
			</form>
		</Section>
	)
}

import Tabs from './components/Tabs.jsx'

const Admin = () => {
	const [stats, setStats] = useState({
		totalUsers: 0,
		totalCourses: 0,
		totalEnrollments: 0,
		activeUsers: 0
	});
	const [users, setUsers] = useState([]);
	const [courses, setCourses] = useState([]);
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState(null);
	const [showUserModal, setShowUserModal] = useState(false);
	const [showCourseModal, setShowCourseModal] = useState(false);
	const [showCourseViewModal, setShowCourseViewModal] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [editingCourse, setEditingCourse] = useState(null);
	const [viewingCourse, setViewingCourse] = useState(null);
	const [userForm, setUserForm] = useState({
		name: '',
		email: '',
		phone: '',
		farmLocation: '',
		role: 'farmer'
	});
	const [courseForm, setCourseForm] = useState({
		title: '',
		description: '',
		category: '',
		coverImage: '',
		price: 0,
		currency: 'KES',
		isFree: false,
		lessons: []
	});
	const [adminLoginForm, setAdminLoginForm] = useState({ email: '', password: '' });
	const [adminLoginError, setAdminLoginError] = useState('');
	const [adminLoginLoading, setAdminLoginLoading] = useState(false);
	const [modalError, setModalError] = useState('');
	const [modalSuccess, setModalSuccess] = useState('');
	const [toastMsg, setToastMsg] = useState('');

	const showToast = (msg) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(''), 3000);
	};
	const [exportFilters, setExportFilters] = useState({ type: 'all', courseId: '', dateFrom: '', dateTo: '' });
	const [paymentsFilter, setPaymentsFilter] = useState({ courseId: '', search: '' });
	const [exporting, setExporting] = useState(false);

	const handleExportPDF = async () => {
		setExporting(true);
		try {
			const token = localStorage.getItem('token');
			const params = new URLSearchParams();
			if (exportFilters.type) params.set('type', exportFilters.type);
			if (exportFilters.courseId) params.set('courseId', exportFilters.courseId);
			if (exportFilters.dateFrom) params.set('dateFrom', exportFilters.dateFrom);
			if (exportFilters.dateTo) params.set('dateTo', exportFilters.dateTo);

			const res = await fetch(`${getApiBaseUrl()}/api/admin/export?${params}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!res.ok) throw new Error('Export failed');
			const data = await res.json();

			const usersHtml = data.users ? `
				<h2>Users (${data.users.length})</h2>
				<table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Farm Location</th><th>Role</th><th>Joined</th></tr></thead>
				<tbody>${data.users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.phone || '-'}</td><td>${u.farmLocation || '-'}</td><td>${u.role}</td><td>${new Date(u.createdAt).toLocaleDateString()}</td></tr>`).join('')}</tbody></table>` : '';

			const paymentsHtml = data.payments ? `
				<h2>Paid Enrollments (${data.payments.length})</h2>
				<table><thead><tr><th>Student</th><th>Email</th><th>Course</th><th>Amount</th><th>Date</th></tr></thead>
				<tbody>${data.payments.map(p => `<tr><td>${p.user?.name || '-'}</td><td>${p.user?.email || '-'}</td><td>${p.course?.title || '-'}</td><td>${p.currency || 'KES'} ${p.amount}</td><td>${new Date(p.createdAt).toLocaleDateString()}</td></tr>`).join('')}</tbody></table>` : '';

			const win = window.open('', '_blank');
			win.document.write(`<!DOCTYPE html><html><head><title>M-Farm LMS Export</title><style>
				body{font-family:Arial,sans-serif;margin:30px;color:#111}
				h1{color:#29AB87}h2{color:#1F876C;margin-top:30px}
				table{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px}
				th{background:#29AB87;color:#fff;padding:8px;text-align:left}
				td{padding:7px 8px;border-bottom:1px solid #e5e7eb}
				tr:nth-child(even) td{background:#f9fafb}
				.meta{color:#6b7280;font-size:12px;margin-bottom:20px}
				@media print{button{display:none}}
			</style></head><body>
				<h1>M-Farm LMS — Admin Export</h1>
				<p class="meta">Exported: ${new Date(data.exportedAt).toLocaleString()} | Type: ${data.filters.type}${data.filters.dateFrom ? ` | From: ${data.filters.dateFrom}` : ''}${data.filters.dateTo ? ` | To: ${data.filters.dateTo}` : ''}</p>
				<button onclick="window.print()" style="background:#29AB87;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:14px;margin-bottom:20px">🖨 Print / Save as PDF</button>
				${usersHtml}${paymentsHtml}
			</body></html>`);
			win.document.close();
		} catch (err) {
			alert('Export failed: ' + err.message);
		} finally {
			setExporting(false);
		}
	};

	const navigate = useNavigate();

	const checkAuth = useCallback(() => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');
		
		if (token && userData) {
			const parsedUser = JSON.parse(userData);
			if (parsedUser.role === 'admin') {
				setIsAuthenticated(true);
				setUser(parsedUser);
				fetchStats();
				fetchUsers();
				fetchCourses();
				fetchPayments();
			} else {
				setIsAuthenticated(false);
				setUser(parsedUser);
			}
		} else {
			setIsAuthenticated(false);
			setUser(null);
		}
	}, []);
	const handleAdminLogin = async (e) => {
		e.preventDefault();
		setAdminLoginError('');
		setAdminLoginLoading(true);
		try {
			const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(adminLoginForm),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.message || 'Admin login failed');
			}
			if (data?.user?.role !== 'admin') {
				throw new Error('This account is not an admin account');
			}
			localStorage.setItem('token', data.token);
			localStorage.setItem('user', JSON.stringify(data.user));
			setIsAuthenticated(true);
			setUser(data.user);
			fetchStats();
			fetchUsers();
			fetchCourses();
			fetchPayments();
		} catch (error) {
			setAdminLoginError(error.message);
		} finally {
			setAdminLoginLoading(false);
		}
	};


	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	// If already authenticated as admin, no need to show login — stay on page (dashboard renders below)
	// If authenticated as non-admin, show logout prompt (handled in render)

	const fetchStats = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/admin/stats`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			if (response.ok) {
				const data = await response.json();
				setStats(data);
			} else {
				const errorData = await response.json();
				console.error('Admin stats error:', errorData);
			}
		} catch (error) {
			console.error('Error fetching stats:', error);
		}
	};

	const fetchUsers = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/admin/users`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			setUsers(data);
		} catch (error) {
			console.error('Error fetching users:', error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCourses = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/admin/courses`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			setCourses(data);
		} catch (error) {
			console.error('Error fetching courses:', error);
		}
	};

	const fetchPayments = async () => {
		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`${getApiBaseUrl()}/api/admin/export?type=payments`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (res.ok) {
				const data = await res.json();
				setPayments(data.payments || []);
			}
		} catch (error) {
			console.error('Error fetching payments:', error);
		}
	};

	// User CRUD operations
	const createUser = async (userData) => {
		setModalError('');
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/admin/users`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			});
			const data = await response.json();
			if (response.ok) {
				setUsers(prev => [data.user, ...prev]);
				setShowUserModal(false);
				resetUserForm();
				showToast('User created successfully!');
			} else {
				setModalError(data.message || 'Error creating user');
			}
		} catch (error) {
			console.error('Error creating user:', error);
			setModalError('Network error. Please try again.');
		}
	};

	const updateUser = async (userId, userData) => {
		setModalError('');
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/admin/users/${userId}`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(userData)
			});
			const data = await response.json();
			if (response.ok) {
				setUsers(prev => prev.map(u => u._id === userId ? data.user : u));
				setShowUserModal(false);
				setEditingUser(null);
				resetUserForm();
				showToast('User updated successfully!');
			} else {
				setModalError(data.message || 'Error updating user');
			}
		} catch (error) {
			console.error('Error updating user:', error);
			setModalError('Network error. Please try again.');
		}
	};

	const deleteUser = async (userId) => {
		if (!confirm('Are you sure you want to delete this user?')) return;
		
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/admin/users/${userId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			if (response.ok) {
				setUsers(prev => prev.filter(u => u._id !== userId));
				showToast('User deleted successfully!');
			} else {
				showToast('Error: ' + data.message);
			}
		} catch (error) {
			console.error('Error deleting user:', error);
			showToast('Network error. Please try again.');
		}
	};

	// Course CRUD operations
	const createCourse = async (courseData) => {
		setModalError('');
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/admin/courses`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(courseData)
			});
			const data = await response.json();
			if (response.ok) {
				setCourses(prev => [data.course, ...prev]);
				setShowCourseModal(false);
				resetCourseForm();
				showToast('Course created successfully!');
			} else {
				setModalError(data.message || 'Error creating course');
			}
		} catch (error) {
			console.error('Error creating course:', error);
			setModalError('Network error. Please try again.');
		}
	};

	const updateCourse = async (courseId, courseData) => {
		setModalError('');
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/admin/courses/${courseId}`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(courseData)
			});
			const data = await response.json();
			if (response.ok) {
				setCourses(prev => prev.map(c => c._id === courseId ? data.course : c));
				setShowCourseModal(false);
				setEditingCourse(null);
				resetCourseForm();
				showToast('Course updated successfully!');
			} else {
				setModalError(data.message || 'Error updating course');
			}
		} catch (error) {
			console.error('Error updating course:', error);
			setModalError('Network error. Please try again.');
		}
	};

	const deleteCourse = async (courseId) => {
		if (!confirm('Are you sure you want to delete this course?')) return;
		
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/admin/courses/${courseId}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			if (response.ok) {
				setCourses(prev => prev.filter(c => c._id !== courseId));
				showToast('Course deleted successfully!');
			} else {
				showToast('Error: ' + data.message);
			}
		} catch (error) {
			console.error('Error deleting course:', error);
			showToast('Network error. Please try again.');
		}
	};

	// Form handlers
	const resetUserForm = () => {
		setUserForm({
			name: '',
			email: '',
			phone: '',
			farmLocation: '',
			role: 'farmer'
		});
		setEditingUser(null);
	};

	const resetCourseForm = () => {
		setCourseForm({
			title: '',
			description: '',
			category: '',
			coverImage: '',
			price: 0,
			currency: 'KES',
			isFree: false,
			lessons: []
		});
		setEditingCourse(null);
	};

	const handleUserSubmit = (e) => {
		e.preventDefault();
		if (editingUser) {
			updateUser(editingUser._id, userForm);
		} else {
			createUser(userForm);
		}
	};

	const handleCourseSubmit = (e) => {
		e.preventDefault();
		if (editingCourse) {
			updateCourse(editingCourse._id, courseForm);
		} else {
			createCourse(courseForm);
		}
	};

	const openUserModal = (user = null) => {
		setModalError('');
		if (user) {
			setEditingUser(user);
			setUserForm({
				name: user.name,
				email: user.email,
				phone: user.phone || '',
				farmLocation: user.farmLocation || '',
				role: user.role
			});
		} else {
			resetUserForm();
		}
		setShowUserModal(true);
	};

	const openCourseModal = (course = null) => {
		setModalError('');
		if (course) {
			setEditingCourse(course);
			setCourseForm({
				title: course.title,
				description: course.description || '',
				category: course.category || '',
				coverImage: course.coverImage || '',
				price: course.price || 0,
				currency: course.currency || 'KES',
				isFree: course.isFree || false,
				lessons: course.lessons || []
			});
		} else {
			resetCourseForm();
		}
		setShowCourseModal(true);
	};

	const viewCourse = (course) => {
		setViewingCourse(course);
		setShowCourseViewModal(true);
	};

	const UsersTable = () => (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-sm font-semibold text-jungle-300 uppercase tracking-wider">Users Management</h3>
				<button
					onClick={() => openUserModal()}
					className="px-4 py-1.5 bg-jungle-600 hover:bg-jungle-500 text-white text-sm rounded-lg border border-jungle-500/50 transition-colors"
				>
					+ Add User
				</button>
			</div>
			<div className="overflow-x-auto rounded-lg border border-jungle-700/40">
				<table className="min-w-full divide-y divide-jungle-800/60">
					<thead className="bg-jungle-900/60">
						<tr>
							{['Name','Email','Phone','Farm Location','Role','Joined','Actions'].map(h => (
								<th key={h} className="px-4 py-3 text-left text-xs font-semibold text-jungle-400 uppercase tracking-wider">{h}</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-jungle-800/40">
						{users.map((user) => (
							<tr key={user._id} className="hover:bg-jungle-900/40 transition-colors">
								<td className="px-4 py-3 text-sm font-medium text-white">{user.name}</td>
								<td className="px-4 py-3 text-sm text-jungle-200">{user.email}</td>
								<td className="px-4 py-3 text-sm text-jungle-200">{user.phone || 'N/A'}</td>
								<td className="px-4 py-3 text-sm text-jungle-200">{user.farmLocation || 'N/A'}</td>
								<td className="px-4 py-3">
									<span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
										user.role === 'admin' ? 'bg-red-900/60 text-red-300 border border-red-700/50' : 'bg-jungle-900/60 text-jungle-300 border border-jungle-700/50'
									}`}>
										{user.role}
									</span>
								</td>
								<td className="px-4 py-3 text-sm text-jungle-300">{new Date(user.createdAt).toLocaleDateString()}</td>
								<td className="px-4 py-3 text-sm">
									<div className="flex space-x-3">
										<button onClick={() => openUserModal(user)} className="text-jungle-400 hover:text-jungle-200 transition-colors">Edit</button>
										{user.role !== 'admin' && (
											<button onClick={() => deleteUser(user._id)} className="text-red-500 hover:text-red-300 transition-colors">Delete</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);

	const PaymentsTable = () => {
		const filtered = payments.filter(p => {
			const matchCourse = !paymentsFilter.courseId || p.course?._id === paymentsFilter.courseId;
			const q = paymentsFilter.search.toLowerCase();
			const matchSearch = !q || p.user?.name?.toLowerCase().includes(q) || p.user?.email?.toLowerCase().includes(q) || p.course?.title?.toLowerCase().includes(q);
			return matchCourse && matchSearch;
		});
		return (
			<div className="p-4">
				<div className="flex flex-wrap gap-3 items-center mb-4">
					<h3 className="text-sm font-semibold text-jungle-300 uppercase tracking-wider mr-auto">Paid Enrollments</h3>
					<input
						type="text"
						placeholder="Search name / email / course…"
						value={paymentsFilter.search}
						onChange={e => setPaymentsFilter(f => ({ ...f, search: e.target.value }))}
						className="bg-black/40 border border-jungle-700/60 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500 w-52"
					/>
					<select
						value={paymentsFilter.courseId}
						onChange={e => setPaymentsFilter(f => ({ ...f, courseId: e.target.value }))}
						className="bg-black/40 border border-jungle-700/60 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500"
					>
						<option value="">All courses</option>
						{courses.filter(c => !c.isFree).map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
					</select>
					<button
						onClick={() => {
							setExportFilters(f => ({ ...f, type: 'payments', courseId: paymentsFilter.courseId }));
							setTimeout(handleExportPDF, 0);
						}}
						className="px-4 py-1.5 bg-jungle-600 hover:bg-jungle-500 text-white text-sm rounded-lg border border-jungle-500/50 transition-colors"
					>
						⬇ Download PDF
					</button>
				</div>
				<div className="overflow-x-auto rounded-lg border border-jungle-700/40">
					<table className="min-w-full divide-y divide-jungle-800/60">
						<thead className="bg-jungle-900/60">
							<tr>
								{['Student','Email','Course','Amount','Date'].map(h => (
									<th key={h} className="px-4 py-3 text-left text-xs font-semibold text-jungle-400 uppercase tracking-wider">{h}</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-jungle-800/40">
							{filtered.length === 0 ? (
								<tr><td colSpan={5} className="px-4 py-6 text-center text-jungle-400 text-sm">No paid enrollments found.</td></tr>
							) : filtered.map((p) => (
								<tr key={p._id} className="hover:bg-jungle-900/40 transition-colors">
									<td className="px-4 py-3 text-sm font-medium text-white">{p.user?.name || '-'}</td>
									<td className="px-4 py-3 text-sm text-jungle-200">{p.user?.email || '-'}</td>
									<td className="px-4 py-3 text-sm text-jungle-200">{p.course?.title || '-'}</td>
									<td className="px-4 py-3 text-sm text-jungle-200">{p.currency || 'KES'} {p.amount}</td>
									<td className="px-4 py-3 text-sm text-jungle-300">{new Date(p.createdAt).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	const CoursesTable = () => (
		<div className="p-4">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-sm font-semibold text-jungle-300 uppercase tracking-wider">Courses Management</h3>
				<button
					onClick={() => openCourseModal()}
					className="px-4 py-1.5 bg-jungle-600 hover:bg-jungle-500 text-white text-sm rounded-lg border border-jungle-500/50 transition-colors"
				>
					+ Add Course
				</button>
			</div>
			<div className="overflow-x-auto rounded-lg border border-jungle-700/40">
				<table className="min-w-full divide-y divide-jungle-800/60">
					<thead className="bg-jungle-900/60">
						<tr>
							{['Title','Category','Price','Status','Created','Actions'].map(h => (
								<th key={h} className="px-4 py-3 text-left text-xs font-semibold text-jungle-400 uppercase tracking-wider">{h}</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-jungle-800/40">
						{courses.map((course) => (
							<tr key={course._id} className="hover:bg-jungle-900/40 transition-colors">
								<td className="px-4 py-3 text-sm font-medium text-white">{course.title}</td>
								<td className="px-4 py-3 text-sm text-jungle-200">{course.category || 'N/A'}</td>
								<td className="px-4 py-3 text-sm text-jungle-200">{course.isFree ? 'Free' : `${course.currency} ${course.price}`}</td>
								<td className="px-4 py-3">
									<span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
										course.isFree ? 'bg-jungle-900/60 text-jungle-300 border border-jungle-700/50' : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
									}`}>
										{course.isFree ? 'Free' : 'Paid'}
									</span>
								</td>
								<td className="px-4 py-3 text-sm text-jungle-300">{new Date(course.createdAt).toLocaleDateString()}</td>
								<td className="px-4 py-3 text-sm">
									<div className="flex space-x-3">
										<button onClick={() => viewCourse(course)} className="text-blue-400 hover:text-blue-200 transition-colors">View</button>
										<button onClick={() => openCourseModal(course)} className="text-jungle-400 hover:text-jungle-200 transition-colors">Edit</button>
										<button onClick={() => deleteCourse(course._id)} className="text-red-500 hover:text-red-300 transition-colors">Delete</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);

	if (!isAuthenticated) {
		// Regular (non-admin) logged-in user — prompt to log out
		if (user && user.role !== 'admin') {
			return (
				<div className="min-h-[60vh] flex items-center justify-center">
					<div className="rounded-2xl border border-jungle-700 bg-gradient-to-br from-jungle-900 to-gray-950 p-10 max-w-md w-full text-center shadow-2xl shadow-jungle-900/40">
						<div className="mb-4 text-4xl">🔒</div>
						<h2 className="text-xl font-bold text-white mb-2">Admin Access Only</h2>
						<p className="text-jungle-200 mb-6 text-sm">
							You are signed in as <span className="font-semibold text-white">{user.name}</span>. This area is restricted to administrators. Please log out and sign in with admin credentials.
						</p>
						<button
							onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
							className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
						>
							Log Out
						</button>
					</div>
				</div>
			);
		}

		// Not logged in — show admin login form
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<div className="rounded-2xl border border-jungle-700 bg-gradient-to-br from-jungle-900 to-gray-950 p-10 max-w-md w-full shadow-2xl shadow-jungle-900/40">
					<div className="mb-6 text-center">
						<div className="text-4xl mb-3">🛡️</div>
						<h2 className="text-2xl font-bold text-white tracking-wide">Admin Console</h2>
						<p className="mt-2 text-sm font-semibold text-red-400">Please enter your admin credentials to log in</p>
					</div>
					<form onSubmit={handleAdminLogin} className="grid gap-3">
						<input
							className="border border-jungle-600/60 bg-black/30 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-jungle-400 placeholder-jungle-400/70"
							placeholder="Admin Email"
							type="email"
							value={adminLoginForm.email}
							onChange={(e) => setAdminLoginForm((prev) => ({ ...prev, email: e.target.value }))}
							required
						/>
						<input
							className="border border-jungle-600/60 bg-black/30 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-jungle-400 placeholder-jungle-400/70"
							placeholder="Admin Password"
							type="password"
							value={adminLoginForm.password}
							onChange={(e) => setAdminLoginForm((prev) => ({ ...prev, password: e.target.value }))}
							required
						/>
						<button
							type="submit"
							disabled={adminLoginLoading}
							className="py-2.5 rounded-lg bg-jungle-500 hover:bg-jungle-600 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{adminLoginLoading ? 'Signing in…' : 'Sign In'}
						</button>
						{adminLoginError && <p className="text-sm text-red-400 text-center">{adminLoginError}</p>}
					</form>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen rounded-2xl border border-jungle-700 bg-gradient-to-br from-jungle-900 via-gray-950 to-jungle-950 text-white shadow-2xl shadow-jungle-900/30 overflow-hidden">
			{/* Header bar */}
			<div className="flex items-center justify-between px-6 py-4 border-b border-jungle-700/60 bg-black/30 backdrop-blur">
				<div className="flex items-center gap-3">
					<span className="text-2xl">🛡️</span>
					<div>
						<h1 className="text-lg font-bold tracking-widest text-jungle-300 uppercase">Admin Console</h1>
						<p className="text-xs text-jungle-400">Welcome, <span className="text-white font-semibold">{user?.name}</span></p>
					</div>
				</div>
				<button
					onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
					className="px-4 py-1.5 rounded-lg bg-red-700/80 hover:bg-red-600 text-white text-sm font-semibold border border-red-600/50 transition-colors"
				>
					Log Out
				</button>
			</div>

			<div className="p-6 space-y-6">
				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{[
						{ label: 'Total Users', value: stats.totalUsers, icon: '👥' },
						{ label: 'Total Courses', value: stats.totalCourses, icon: '📚' },
						{ label: 'Enrollments', value: stats.totalEnrollments, icon: '🎓' },
						{ label: 'Active Learners', value: stats.activeUsers, icon: '🌱' },
					].map(({ label, value, icon }) => (
						<div key={label} className="rounded-xl border border-jungle-700/60 bg-black/30 p-4 hover:border-jungle-500 hover:-translate-y-1 transition-all">
							<div className="text-2xl mb-1">{icon}</div>
							<div className="text-xs text-jungle-400 uppercase tracking-wider">{label}</div>
							<div className="text-3xl font-bold text-jungle-300 mt-1">{value}</div>
						</div>
					))}
				</div>

				{loading ? (
					<div className="text-center py-12">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jungle-400 mx-auto mb-4" />
						<p className="text-jungle-300">Loading data…</p>
					</div>
				) : (
					<>
					{/* Export */}
					<div className="rounded-xl border border-jungle-700/60 bg-black/30 p-5">
						<h3 className="text-sm font-semibold text-jungle-300 uppercase tracking-wider mb-4">📥 Export Data as PDF</h3>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
							<div>
								<label className="block text-xs text-jungle-400 mb-1">Data Type</label>
								<select
									value={exportFilters.type}
									onChange={e => setExportFilters(f => ({ ...f, type: e.target.value }))}
									className="w-full bg-black/40 border border-jungle-700/60 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500"
								>
									<option value="all">All (Users + Payments)</option>
									<option value="users">Users only</option>
									<option value="payments">Paid Enrollments only</option>
								</select>
							</div>
							<div>
								<label className="block text-xs text-jungle-400 mb-1">Course (optional)</label>
								<select
									value={exportFilters.courseId}
									onChange={e => setExportFilters(f => ({ ...f, courseId: e.target.value }))}
									className="w-full bg-black/40 border border-jungle-700/60 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500"
								>
									<option value="">All courses</option>
									{courses.filter(c => !c.isFree).map(c => (
										<option key={c._id} value={c._id}>{c.title}</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-xs text-jungle-400 mb-1">From date</label>
								<input type="date" value={exportFilters.dateFrom} onChange={e => setExportFilters(f => ({ ...f, dateFrom: e.target.value }))} className="w-full bg-black/40 border border-jungle-700/60 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500" />
							</div>
							<div>
								<label className="block text-xs text-jungle-400 mb-1">To date</label>
								<input type="date" value={exportFilters.dateTo} onChange={e => setExportFilters(f => ({ ...f, dateTo: e.target.value }))} className="w-full bg-black/40 border border-jungle-700/60 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500" />
							</div>
						</div>
						<button
							onClick={handleExportPDF}
							disabled={exporting}
							className="px-5 py-2 bg-jungle-600 hover:bg-jungle-500 text-white text-sm font-semibold rounded-lg border border-jungle-500/50 disabled:opacity-50 transition-colors"
						>
							{exporting ? 'Generating…' : '⬇ Download PDF'}
						</button>
					</div>

					{/* Tabs */}
					<div className="rounded-xl border border-jungle-700/60 bg-black/20 overflow-hidden">
						<Tabs tabs={[
							{ label: 'Courses', content: <CoursesTable /> },
							{ label: 'Users', content: <UsersTable /> },
							{ label: 'Payments', content: <PaymentsTable /> },
						]} />
					</div>
					</>
				)}
			</div>

			{/* User Modal */}
			{showUserModal && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="rounded-2xl border border-jungle-700 bg-gradient-to-br from-jungle-900 to-gray-950 p-6 w-full max-w-md shadow-2xl">
						<h3 className="text-lg font-bold text-white mb-5">
							{editingUser ? 'Edit User' : 'Add New User'}
						</h3>
						<form onSubmit={handleUserSubmit}>
							<div className="space-y-3">
								{[
									{ label: 'Name', key: 'name', type: 'text', required: true },
									{ label: 'Email', key: 'email', type: 'email', required: true },
									{ label: 'Phone', key: 'phone', type: 'text' },
									{ label: 'Farm Location', key: 'farmLocation', type: 'text' },
								].map(({ label, key, type, required }) => (
									<div key={key}>
										<label className="block text-xs text-jungle-400 mb-1">{label}</label>
										<input
											type={type}
											value={userForm[key]}
											onChange={(e) => setUserForm({...userForm, [key]: e.target.value})}
											className="w-full bg-black/30 border border-jungle-700/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500"
											required={required}
										/>
									</div>
								))}
								<div>
									<label className="block text-xs text-jungle-400 mb-1">Role</label>
									<select
										value={userForm.role}
										onChange={(e) => setUserForm({...userForm, role: e.target.value})}
										className="w-full bg-black/30 border border-jungle-700/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500"
									>
										<option value="farmer">Farmer</option>
										<option value="admin">Admin</option>
									</select>
								</div>
							</div>
							<div className="flex justify-end gap-2 mt-6">
								{modalError && <p className="text-xs text-red-400 self-center mr-auto">{modalError}</p>}
								<button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 rounded-lg border border-jungle-700/60 text-jungle-300 hover:bg-jungle-900/40 text-sm transition-colors">Cancel</button>
								<button type="submit" className="px-4 py-2 rounded-lg bg-jungle-600 hover:bg-jungle-500 text-white text-sm font-semibold transition-colors">{editingUser ? 'Update' : 'Create'}</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Course Modal */}
			{showCourseModal && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
					<div className="rounded-2xl border border-jungle-700 bg-gradient-to-br from-jungle-900 to-gray-950 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
						<h3 className="text-lg font-bold text-white mb-5">
							{editingCourse ? 'Edit Course' : 'Add New Course'}
						</h3>
						<form onSubmit={handleCourseSubmit}>
							<div className="space-y-3">
								<div>
									<label className="block text-xs text-jungle-400 mb-1">Title</label>
									<input type="text" value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} className="w-full bg-black/30 border border-jungle-700/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500" required />
								</div>
								<div>
									<label className="block text-xs text-jungle-400 mb-1">Description</label>
									<textarea value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} className="w-full bg-black/30 border border-jungle-700/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500" rows="3" />
								</div>
								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="block text-xs text-jungle-400 mb-1">Category</label>
										<input type="text" value={courseForm.category} onChange={(e) => setCourseForm({...courseForm, category: e.target.value})} className="w-full bg-black/30 border border-jungle-700/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500" />
									</div>
									<div>
										<label className="block text-xs text-jungle-400 mb-1">Cover Image URL</label>
										<input type="url" value={courseForm.coverImage} onChange={(e) => setCourseForm({...courseForm, coverImage: e.target.value})} className="w-full bg-black/30 border border-jungle-700/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500" />
									</div>
								</div>
								<div className="grid grid-cols-3 gap-3">
									<div>
										<label className="block text-xs text-jungle-400 mb-1">Price</label>
										<input type="number" value={courseForm.price} onChange={(e) => setCourseForm({...courseForm, price: parseFloat(e.target.value) || 0})} className="w-full bg-black/30 border border-jungle-700/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500" min="0" />
									</div>
									<div>
										<label className="block text-xs text-jungle-400 mb-1">Currency</label>
										<select value={courseForm.currency} onChange={(e) => setCourseForm({...courseForm, currency: e.target.value})} className="w-full bg-black/30 border border-jungle-700/60 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500">
											<option value="KES">KES</option>
											<option value="USD">USD</option>
										</select>
									</div>
									<div className="flex items-end pb-2">
										<label className="flex items-center gap-2 cursor-pointer">
											<input type="checkbox" checked={courseForm.isFree} onChange={(e) => setCourseForm({...courseForm, isFree: e.target.checked})} className="accent-jungle-500" />
											<span className="text-sm text-jungle-300">Free Course</span>
										</label>
									</div>
								</div>
							</div>
							<div className="flex justify-end gap-2 mt-6">
								{modalError && <p className="text-xs text-red-400 self-center mr-auto">{modalError}</p>}
								<button type="button" onClick={() => setShowCourseModal(false)} className="px-4 py-2 rounded-lg border border-jungle-700/60 text-jungle-300 hover:bg-jungle-900/40 text-sm transition-colors">Cancel</button>
								<button type="submit" className="px-4 py-2 rounded-lg bg-jungle-600 hover:bg-jungle-500 text-white text-sm font-semibold transition-colors">{editingCourse ? 'Update' : 'Create'}</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Course View Modal */}
			{showCourseViewModal && viewingCourse && (
				<div className="fixed inset-0 bg-black/70 backdrop-blur-sm overflow-y-auto flex items-start justify-center z-50 py-10">
					<div className="rounded-2xl border border-jungle-700 bg-gradient-to-br from-jungle-900 to-gray-950 p-6 w-full max-w-2xl shadow-2xl">
						<div className="flex justify-between items-center mb-5">
							<h3 className="text-lg font-bold text-white">Course Details</h3>
							<button onClick={() => setShowCourseViewModal(false)} className="text-jungle-400 hover:text-white transition-colors">
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</div>
						<div className="space-y-4 text-sm">
							<div className="grid grid-cols-2 gap-4">
								<div><p className="text-xs text-jungle-400 mb-1">Title</p><p className="text-white">{viewingCourse.title}</p></div>
								<div><p className="text-xs text-jungle-400 mb-1">Category</p><p className="text-white">{viewingCourse.category || 'N/A'}</p></div>
							</div>
							<div><p className="text-xs text-jungle-400 mb-1">Description</p><p className="text-jungle-100">{viewingCourse.description || 'No description available'}</p></div>
							<div className="grid grid-cols-3 gap-4">
								<div><p className="text-xs text-jungle-400 mb-1">Price</p><p className="text-white">{viewingCourse.isFree ? 'Free' : `${viewingCourse.currency} ${viewingCourse.price}`}</p></div>
								<div><p className="text-xs text-jungle-400 mb-1">Status</p>
									<span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${viewingCourse.isFree ? 'bg-jungle-900/60 text-jungle-300 border border-jungle-700/50' : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'}`}>{viewingCourse.isFree ? 'Free' : 'Paid'}</span>
								</div>
								<div><p className="text-xs text-jungle-400 mb-1">Created</p><p className="text-white">{new Date(viewingCourse.createdAt).toLocaleDateString()}</p></div>
							</div>
							{viewingCourse.coverImage && (
								<div><p className="text-xs text-jungle-400 mb-2">Cover Image</p>
									<img src={viewingCourse.coverImage} alt={viewingCourse.title} className="w-full h-44 object-cover rounded-xl border border-jungle-700/40" onError={(e) => { e.target.style.display = 'none'; }} />
								</div>
							)}
							{viewingCourse.lessons && viewingCourse.lessons.length > 0 && (
								<div>
									<p className="text-xs text-jungle-400 mb-2">Lessons ({viewingCourse.lessons.length})</p>
									<div className="space-y-2">
										{viewingCourse.lessons.map((lesson, index) => (
											<div key={index} className="p-3 rounded-lg border border-jungle-700/40 bg-black/20">
												<p className="font-medium text-white">{lesson.title}</p>
												{lesson.description && <p className="text-xs text-jungle-300 mt-1">{lesson.description}</p>}
												{lesson.videoUrl && <p className="text-xs text-blue-400 mt-1">Video: {lesson.videoUrl}</p>}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
						<div className="flex justify-end mt-6">
							<button onClick={() => setShowCourseViewModal(false)} className="px-4 py-2 rounded-lg border border-jungle-700/60 text-jungle-300 hover:bg-jungle-900/40 text-sm transition-colors">Close</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

import ProgressBar from './components/ProgressBar.jsx'
import PaymentCallback from './components/PaymentCallback.jsx'
import CourseQuiz from './components/CourseQuiz.jsx'

// Global function to refresh enrollments
let refreshEnrollments = null;

const Portal = () => {
	const [user, setUser] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [enrollments, setEnrollments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedEnrollment, setSelectedEnrollment] = useState(null);
	const [showProgressModal, setShowProgressModal] = useState(false);

	const checkAuth = useCallback(() => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');
		
		if (token && userData) {
			const parsedUser = JSON.parse(userData);
			setIsAuthenticated(true);
			setUser(parsedUser);
			fetchEnrollments();
		} else {
			setIsAuthenticated(false);
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const fetchEnrollments = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/enrollments/me`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			
			if (response.ok) {
				const data = await response.json();
			setEnrollments(data);
			} else {
				console.error('Failed to fetch enrollments:', response.status);
				const errorText = await response.text();
				console.error('Error response:', errorText);
				setEnrollments([]);
			}
		} catch (error) {
			console.error('Error fetching enrollments:', error);
			setEnrollments([]);
		} finally {
			setLoading(false);
		}
	};

	// Set global reference
	refreshEnrollments = fetchEnrollments;

	const fetchDetailedProgress = async (enrollmentId) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/enrollments/${enrollmentId}/progress`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				setSelectedEnrollment(data);
				setShowProgressModal(true);
			} else {
				console.error('Failed to fetch detailed progress:', response.status);
			}
		} catch (error) {
			console.error('Error fetching detailed progress:', error);
		}
	};

	const markLessonComplete = async (enrollmentId, lessonId) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/enrollments/${enrollmentId}/lessons/${lessonId}/complete`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			
			if (response.ok) {
				const data = await response.json();
				// Update the enrollment in the list
				setEnrollments(prev => prev.map(enrollment => 
					enrollment._id === enrollmentId 
						? { ...enrollment, progress: data.progress, completed: data.completed }
						: enrollment
				));
				// Refresh detailed progress if modal is open
				if (showProgressModal && selectedEnrollment && selectedEnrollment.enrollment._id === enrollmentId) {
					fetchDetailedProgress(enrollmentId);
				}
				alert('Lesson marked as completed!');
			} else {
				alert('Failed to mark lesson as completed');
			}
		} catch (error) {
			console.error('Error marking lesson as completed:', error);
			alert('Error marking lesson as completed');
		}
	};

	if (!isAuthenticated) {
		return (
			<Section title="Farmer Portal">
				<div className="text-center py-8">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						<strong>Access Required:</strong> Please log in to access your farmer portal
					</div>
					<p className="text-gray-600 mb-4">Sign in to view your enrolled courses and track your progress.</p>
					<div className="space-x-4">
						<Link to="/login" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle-500 text-white hover:bg-jungle-600">
							Login
						</Link>
						<Link to="/register" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium border border-jungle-500 text-jungle-500 hover:bg-jungle-50">
							Register
						</Link>
					</div>
				</div>
			</Section>
		);
	}

	return (
		<Section title="Farmer Portal">
			<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
				Welcome back, {user?.name}! Here are your enrolled courses and progress.
			</div>
			
			<div className="grid gap-6">
				<div className="rounded-xl border border-jungle-100 p-4 bg-white shadow-sm">
					<div className="flex justify-between items-center mb-4">
						<h3 className="font-semibold">My Enrolled Courses</h3>
						<div className="flex gap-2">
							<button 
								onClick={fetchEnrollments}
								className="px-3 py-1 bg-jungle-500 text-white text-sm rounded hover:bg-jungle-600 transition-colors"
							>
								Refresh
							</button>
							<button 
								onClick={() => {
									localStorage.removeItem('token');
									localStorage.removeItem('user');
									window.location.href = '/login';
								}}
								className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
							>
								Logout
							</button>
						</div>
					</div>
					{loading ? (
						<div className="text-center py-4">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-jungle-500 mx-auto mb-2"></div>
							<p>Loading your courses...</p>
						</div>
					) : enrollments.length > 0 ? (
						<div className="space-y-4">
							{enrollments.map((enrollment) => (
								<div key={enrollment._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-3 mb-2">
												<span className="font-semibold text-lg text-gray-900">{enrollment.course?.title || 'Course Title'}</span>
												{enrollment.completed && (
													<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
														Completed
													</span>
												)}
											</div>
											<div className="text-sm text-gray-500 mb-2">
												Enrolled: {new Date(enrollment.enrolledAt || enrollment.startedAt).toLocaleDateString()}
												{enrollment.completedAt && (
													<span className="ml-4">
														Completed: {new Date(enrollment.completedAt).toLocaleDateString()}
													</span>
												)}
											</div>
											{enrollment.course?.description && (
												<div className="text-sm text-gray-600 mb-3">
													{enrollment.course.description.substring(0, 150)}...
												</div>
											)}
											<div className="flex items-center gap-4">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<span className="text-sm font-medium text-gray-700">Progress:</span>
														<span className="text-sm text-gray-600 font-medium">{enrollment.progress || 0}%</span>
													</div>
													<ProgressBar value={enrollment.progress || 0} />
												</div>
											</div>
										</div>
										<div className="flex flex-col gap-2 ml-4">
											<button
												onClick={() => fetchDetailedProgress(enrollment._id)}
												className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
											>
												View Progress
											</button>
											<Link 
												to={`/courses/${enrollment.course?.slug}`}
												className="px-3 py-1 bg-jungle-500 text-white text-sm rounded hover:bg-jungle-600 transition-colors text-center"
											>
												Continue Learning
											</Link>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p>You haven't enrolled in any courses yet.</p>
							<Link to="/courses" className="text-jungle-500 hover:underline">Browse available courses</Link>
						</div>
					)}
				</div>
			</div>

			{/* Progress Detail Modal */}
			{showProgressModal && selectedEnrollment && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">
								Progress Details: {selectedEnrollment.course?.title}
							</h3>
							<button
								onClick={() => setShowProgressModal(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								✕
							</button>
						</div>
						
						<div className="mb-6">
							<div className="flex items-center justify-between mb-2">
								<span className="text-lg font-medium">Overall Progress</span>
								<span className="text-lg font-semibold text-jungle-600">
									{selectedEnrollment.enrollment.progress}%
								</span>
							</div>
							<ProgressBar value={selectedEnrollment.enrollment.progress} />
							<div className="flex justify-between text-sm text-gray-600 mt-2">
								<span>{Array.isArray(selectedEnrollment.enrollment.completedLessons) ? selectedEnrollment.enrollment.completedLessons.length : 0} of {selectedEnrollment.course?.lessons?.length || 0} lessons completed</span>
								{selectedEnrollment.enrollment.completed && (
									<span className="text-green-600 font-medium">Course Completed!</span>
								)}
							</div>
						</div>

						{selectedEnrollment.course?.lessons && selectedEnrollment.course.lessons.length > 0 && (
							<div>
								<h4 className="text-lg font-medium mb-4">Lessons</h4>
								<div className="space-y-3">
									{selectedEnrollment.course.lessons.map((lesson, index) => {
										const completedLessons = Array.isArray(selectedEnrollment.enrollment.completedLessons) 
											? selectedEnrollment.enrollment.completedLessons 
											: [];
										const isCompleted = completedLessons.includes(lesson._id || index.toString());
										return (
											<div key={lesson._id || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
												<div className="flex items-center gap-3">
													<div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
														isCompleted 
															? 'bg-green-500 text-white' 
															: 'bg-gray-200 text-gray-600'
													}`}>
														{isCompleted ? '✓' : index + 1}
													</div>
													<div>
														<div className="font-medium">{lesson.title}</div>
														{lesson.duration && (
															<div className="text-sm text-gray-500">{lesson.duration}</div>
														)}
													</div>
												</div>
												<div className="flex items-center gap-2">
													{isCompleted ? (
														<span className="text-green-600 font-medium text-sm">Completed</span>
													) : (
														<button
															onClick={() => markLessonComplete(selectedEnrollment.enrollment._id, lesson._id || index.toString())}
															className="px-3 py-1 bg-jungle-500 text-white text-sm rounded hover:bg-jungle-600 transition-colors"
														>
															Mark Complete
														</button>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}

						<div className="flex justify-end mt-6">
							<button
								onClick={() => setShowProgressModal(false)}
								className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</Section>
	)
}

// Placeholder courses data
const placeholderCourses = [
	{ 
		id: 1, 
		title: 'Financial Modelling for Agribusiness', 
		price: 4500, 
		isFree: false, 
		image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Build financial confidence with farm statements, ratio analysis, and practical modelling.',
		slug: 'financial-modelling-for-agribusiness'
	},
	{ 
		id: 2, 
		title: 'Sustainable Farming Practices', 
		price: 3800, 
		isFree: false, 
		image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Learn practical sustainability systems across soil, water, biodiversity, and resilience.',
		slug: 'sustainable-farming-practices'
	},
]

function CourseGrid({ variant = 'default' }) {
	const [courses, setCourses] = useState(placeholderCourses); // Start with placeholder data
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [usingAPI, setUsingAPI] = useState(false);
	const [connectionStatus, setConnectionStatus] = useState('checking');
	const [connectionMessage, setConnectionMessage] = useState('Checking backend connection...');

	useEffect(() => {
		loadCourses();
	}, []);

	const loadCourses = async () => {
		let backendState = 'checking'
		try {
			setLoading(true);
			setError(null);
			setConnectionStatus('checking');
			setConnectionMessage('Checking backend connection...');
		// Fetching courses from API
			
			// Try to fetch from API with a longer timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

			try {
				const health = await apiGet('/health');
				if (health?.database?.connected) {
					backendState = 'connected'
					setConnectionStatus('connected');
					setConnectionMessage('Connection successful: backend and database are live');
				} else {
					backendState = 'degraded'
					setConnectionStatus('degraded');
					setConnectionMessage(`Backend reachable, database ${health?.database?.state || 'not connected'}`);
				}
			} catch {
				backendState = 'offline'
				setConnectionStatus('offline');
				setConnectionMessage('Backend not reachable. Showing offline course data.');
			}
			
			const data = await apiGet('/api/courses', { signal: controller.signal });
			clearTimeout(timeoutId);
			
			if (data && data.length > 0) {
				setCourses(data);
				setUsingAPI(true);
				if (backendState !== 'offline') {
					setConnectionStatus('connected');
					setConnectionMessage('Connection successful: live courses loaded from database');
				}
			} else {
				setCourses(placeholderCourses);
				setUsingAPI(false);
				if (connectionStatus === 'connected') {
					setConnectionMessage('Connection successful: database connected, no courses found yet');
				}
			}
		} catch (error) {
			console.error('Error fetching courses from API:', error);
			console.error('Error details:', {
				message: error.message,
				name: error.name,
				stack: error.stack
			});
			setError(error.message);
			// Always fallback to placeholder data
			setCourses(placeholderCourses);
			setUsingAPI(false);
			setConnectionStatus('offline');
			setConnectionMessage('Backend not reachable. Showing offline course data.');
		} finally {
			setLoading(false);
		}
	};

	const mosaicSpan = (idx) => {
		const pattern = [
			'lg:col-span-3 lg:row-span-2',
			'lg:col-span-3 lg:row-span-1',
			'lg:col-span-2 lg:row-span-1',
			'lg:col-span-4 lg:row-span-2',
			'lg:col-span-2 lg:row-span-1',
			'lg:col-span-2 lg:row-span-1',
		]
		return pattern[idx % pattern.length]
	}

	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jungle-500 mx-auto mb-4"></div>
				<p>Loading courses...</p>
			</div>
		);
	}

	return (
		<div>
			<div className={`mb-4 rounded-xl border px-4 py-3 text-sm transition-all ${
				connectionStatus === 'connected'
					? 'bg-green-50 border-green-300 text-green-800'
					: connectionStatus === 'degraded'
						? 'bg-yellow-50 border-yellow-300 text-yellow-800'
						: connectionStatus === 'offline'
							? 'bg-red-50 border-red-300 text-red-700'
							: 'bg-jungle-50 border-jungle-200 text-jungle-700'
			}`}>
				<div className="flex items-center gap-2">
					<span className={`inline-block h-2.5 w-2.5 rounded-full ${
						connectionStatus === 'connected'
							? 'bg-green-500'
							: connectionStatus === 'degraded'
								? 'bg-yellow-500'
								: connectionStatus === 'offline'
									? 'bg-red-500'
									: 'bg-jungle-500 animate-pulse'
					}`} />
					<span className="font-medium">{connectionMessage}</span>
				</div>
			</div>

			{error && !usingAPI && (
				<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
					<p className="text-sm text-yellow-800">
						⚠️ Using offline data. Backend connection failed: {error}
					</p>
				</div>
			)}
			
			{usingAPI && (
				<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
					<p className="text-sm text-green-800">
						✅ Connected to database - showing live data
					</p>
				</div>
			)}
			
			{variant === 'mosaic' ? (
				<div className="relative">
					<div className="pointer-events-none absolute left-1/3 top-28 h-2 w-2 rounded-full bg-jungle-200/70 hidden lg:block" />
					<div className="pointer-events-none absolute right-1/4 top-[24rem] h-2 w-2 rounded-full bg-jungle-200/70 hidden lg:block" />
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 auto-rows-[170px]">
						{courses.slice(0, 6).map((course, idx) => (
							<div
								key={course._id || course.id}
								className={`group rounded-2xl overflow-hidden border border-jungle-100/80 bg-white/95 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${mosaicSpan(idx)}`}
							>
								<div className="relative h-full w-full">
									<img
										src={course.coverImage || course.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop'}
										alt={course.title}
										className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-jungle-900/75 via-jungle-900/10 to-transparent" />
									<div className="absolute inset-x-0 bottom-0 p-4">
										<div className="flex items-center justify-between gap-2">
											<div>
												<h3 className="font-semibold text-white drop-shadow">{course.title}</h3>
												<p className="text-xs text-jungle-50/90">{course.isFree ? 'Free' : `Ksh ${course.price}`}</p>
											</div>
											<Link
												to={`/courses/${course.slug}`}
												className="shrink-0 rounded-full border border-white/70 bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur hover:bg-white hover:text-jungle-700 transition-colors"
											>
												Open
											</Link>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
					{courses.length > 6 && (
						<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{courses.slice(6).map((course) => (
								<div
									key={course._id || course.id}
									className="border border-jungle-100 rounded-xl overflow-hidden bg-white/95 transition-colors hover:bg-jungle-50 group shadow-sm hover:shadow-xl"
								>
									<div className="relative overflow-hidden">
										<img
											src={course.coverImage || course.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop'}
											alt={course.title}
											className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-110"
										/>
										<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
									</div>
									<div className="p-4 space-y-2">
										<h3 className="font-semibold text-gray-900">{course.title}</h3>
										<div className="text-sm text-gray-600">
											{course.isFree ? 'Free' : `Ksh ${course.price}`}
										</div>
										<Link
											to={`/courses/${course.slug}`}
											className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium border border-jungle-500 text-jungle-600 hover:bg-jungle-100 transition-colors"
										>
											View
										</Link>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{courses.map(course => (
						<div
							key={course._id || course.id}
							className="border border-jungle-100 rounded-xl overflow-hidden bg-white/95 transition-colors hover:bg-jungle-50 group shadow-sm hover:shadow-xl"
						>
							<div className="relative overflow-hidden">
								<img 
									src={course.coverImage || course.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop'} 
									alt={course.title} 
									className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-110" 
								/>
								<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
							</div>
							<div className="p-4 space-y-2">
								<h3 className="font-semibold text-gray-900">{course.title}</h3>
								{(course.description || course.desc) && (
									<p className="text-sm text-gray-600">{course.description || course.desc}</p>
								)}
								<div className="text-sm text-gray-600">
									{course.isFree ? 'Free' : `Ksh ${course.price}`}
								</div>
								<Link 
									to={`/courses/${course.slug}`}
									className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium border border-jungle-500 text-jungle-600 hover:bg-jungle-100 transition-colors"
								>
									View
								</Link>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}

// CourseDetail component that fetches from API
const CourseDetail = ({ courseSlug }) => {
	const navigate = useNavigate();
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [enrolling, setEnrolling] = useState(false);
	const [isEnrolled, setIsEnrolled] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [paymentStatus, setPaymentStatus] = useState(null);
	const [paymentReference, setPaymentReference] = useState(null);
	const [showQuiz, setShowQuiz] = useState(false);

	const checkAuthStatus = () => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');
		const isAuth = !!(token && userData);
		setIsAuthenticated(isAuth);
		
		// Check if user is an admin
		if (userData) {
			try {
				const user = JSON.parse(userData);
				setIsAdmin(user.role === 'admin');
			} catch (e) {
				setIsAdmin(false);
			}
		} else {
			setIsAdmin(false);
		}
	};

	const loadCourse = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			
			const data = await apiGet(`/api/courses/${courseSlug}`);
			setCourse(data);
			
			// Check enrollment status
			if (data.isFree) {
				// Free courses are always accessible
				setIsEnrolled(true);
			} else if (isAuthenticated) {
				// For paid courses, check if user is enrolled
				try {
					const token = localStorage.getItem('token');
					const response = await fetch(`${getApiBaseUrl()}/api/enrollments/me`, {
						headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
						}
					});
					
					if (response.ok) {
						const enrollments = await response.json();
						const isEnrolledInCourse = enrollments.some(enrollment => 
							enrollment.course && enrollment.course._id === data._id
						);
						setIsEnrolled(isEnrolledInCourse);
					} else {
						setIsEnrolled(false);
					}
				} catch (error) {
					console.error('Error checking enrollment:', error);
					setIsEnrolled(false);
				}
			} else {
				// Not authenticated and not free course
				setIsEnrolled(false);
			}
		} catch (error) {
			console.error('Error fetching course from API:', error);
			setError(error.message);
			// Fallback to placeholder data
			const fallbackCourse = placeholderCourses.find(c => c.slug === courseSlug);
			setCourse(fallbackCourse);
			if (fallbackCourse && fallbackCourse.isFree) {
				setIsEnrolled(true);
			}
		} finally {
			setLoading(false);
		}
	}, [courseSlug, isAuthenticated]);

	useEffect(() => {
		loadCourse();
		checkAuthStatus();
	}, [courseSlug, isAuthenticated, loadCourse]);

	const openLesson = (lesson) => {
		if (lesson.contentHtml) {
			const lessonWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
			lessonWindow.document.write(`
				<!DOCTYPE html>
				<html>
				<head>
					<title>${lesson.title} - ${course.title}</title>
					<style>
						body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
						h1 { color: #29AB87; }
						h2 { color: #1F876C; }
						.lesson-content { max-width: 800px; margin: 0 auto; }
						.back-button { 
							background: #29AB87; 
							color: white; 
							padding: 10px 20px; 
							text-decoration: none; 
							border-radius: 5px; 
							display: inline-block; 
							margin-bottom: 20px;
						}
					</style>
				</head>
				<body>
					<div class="lesson-content">
						<a href="javascript:window.close()" class="back-button">← Close Lesson</a>
						<h1>${lesson.title}</h1>
						<p><strong>Duration:</strong> ${lesson.duration || 'Not specified'}</p>
						<hr>
						${lesson.contentHtml}
					</div>
				</body>
				</html>
			`);
			lessonWindow.document.close();
		} else {
			alert('Lesson content is not available yet.');
		}
	};

	const handleEnroll = async () => {
		// Prevent admins from enrolling
		if (isAdmin) {
			alert('Administrators cannot enroll in courses. Please use a farmer account to enroll.');
			return;
		}
		
		try {
			setEnrolling(true);
			
			if (course.isFree) {
				// Free course - enroll directly, with auth if available
				try {
					const token = localStorage.getItem('token');
					const headers = {
						'Content-Type': 'application/json'
					};
					
					// Add auth header if user is logged in
					if (token) {
						headers['Authorization'] = `Bearer ${token}`;
					}
					
					const response = await fetch(`${getApiBaseUrl()}/api/courses/${course._id}/enroll`, {
						method: 'POST',
						headers: headers
					});
					
					if (response.ok) {
						const data = await response.json();
						alert(data.message || 'Successfully enrolled in free course!');
						setIsEnrolled(true);
						
						// Refresh enrollments if portal is open and user is logged in
						if (refreshEnrollments && token) {
							refreshEnrollments();
						}
						
						// Open first lesson if available
						if (course.lessons && course.lessons.length > 0) {
							const firstLesson = course.lessons[0];
							openLesson(firstLesson);
						} else {
							alert('No lessons available for this course yet.');
						}
					} else {
						const errorData = await response.json();
						console.error('Enrollment error response:', errorData);
						throw new Error(errorData.message || 'Enrollment failed');
					}
				} catch (error) {
					console.error('Enrollment error:', error);
					alert('Enrollment failed. Please try again or contact support.');
				}
			} else {
				// Paid course - redirect directly to Paystack M-Pesa payment
				if (!isAuthenticated) {
					alert('Please log in to enroll in paid courses. You will be redirected to the login page.');
					window.location.href = '/login';
					return;
				}

				// Redirect directly to Paystack M-Pesa payment
				await handlePaystackMpesaPayment();
			}
		} catch (error) {
			alert('Enrollment failed: ' + error.message);
		} finally {
			setEnrolling(false);
		}
	};

	const handlePaystackMpesaPayment = async () => {
		// Check if user is logged in
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');
		
		if (!token || !userData) {
			alert('Please log in first to make a payment');
			window.location.href = '/login';
			return;
		}

		try {
			setEnrolling(true);
			
			const requestBody = {
				courseId: course._id,
				phoneNumber: '254712345678' // Default phone number, user will enter on Paystack
			};
			
			// Use the M-Pesa specific endpoint that redirects to Paystack with mobile money channels
			const response = await fetch(`${getApiBaseUrl()}/api/payments/initiate-mpesa`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});
			
			if (response.ok) {
				const paymentData = await response.json();
				
				// Store payment reference for verification
				setPaymentReference(paymentData.reference);
				setPaymentStatus('pending');
				
				// Redirect to Paystack payment page
				if (paymentData.authorization_url) {
					window.location.href = paymentData.authorization_url;
				} else {
					throw new Error('No authorization URL received from Paystack');
				}
			} else {
				const errorData = await response.json();
				console.error('Paystack M-Pesa payment error response:', errorData);
				
				// Handle specific duplicate payment scenarios
				if (errorData.alreadyEnrolled || errorData.alreadyPaid) {
					alert(errorData.message + ' Redirecting to your portal...');
					window.location.href = '/portal';
					return;
				}
				
				throw new Error(errorData.message || 'Paystack M-Pesa payment initialization failed');
			}
		} catch (error) {
			console.error('Paystack M-Pesa payment initialization error:', error);
			alert('Payment initialization failed: ' + error.message);
		} finally {
			setEnrolling(false);
		}
	};


	const startPaymentVerification = (reference) => {
		let verificationInterval = null;
		let timeoutId = null;
		
		const checkPaymentStatus = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await fetch(`${getApiBaseUrl()}/api/payments/verify/${reference}`, {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				});

				if (response.ok) {
					const data = await response.json();
					
					// Check for successful payment - be more flexible with success detection
					const isSuccess = data.message && (
						data.message.includes('successful') || 
						data.message.includes('enrolled') ||
						data.message.includes('M-Pesa payment successful') ||
						data.status === 'success' ||
						(data.payment && data.payment.status === 'success')
					);
					
					
					if (isSuccess) {
						// Clear intervals and timeouts
						if (verificationInterval) clearInterval(verificationInterval);
						if (timeoutId) clearTimeout(timeoutId);
						
						// Set success status
						setPaymentStatus('success');
						setIsEnrolled(true);
						
						// Show success message and redirect
						alert('Payment successful! You are now enrolled in the course. Redirecting to course...');
						
						// Refresh enrollments if portal is open
						if (refreshEnrollments) {
							refreshEnrollments();
						}
						
						// Open first lesson automatically
						if (course && course.lessons && course.lessons.length > 0) {
							const firstLesson = course.lessons[0];
							openLesson(firstLesson);
						}
						
						// Clear payment reference but keep success status for UI
						setPaymentReference(null);
						
						// Redirect back to course tab after a short delay
						setTimeout(() => {
							// Close any payment windows
							window.close();
							// Focus back to the main window
							window.focus();
						}, 2000);
						
						return; // Exit the function
					} else if (data.status === 'pending') {
						// Payment is still pending, continue waiting
						setPaymentStatus('pending');
					} else {
						// Payment failed or other status
						setPaymentStatus('failed');
					}
				} else {
					console.error('Payment verification request failed:', response.status);
					setPaymentStatus('error');
				}
			} catch (error) {
				console.error('Payment verification error:', error);
				setPaymentStatus('error');
			}
		};

		// Check payment status every 3 seconds for 3 minutes
		verificationInterval = setInterval(checkPaymentStatus, 3000);
		
		// Set timeout
		timeoutId = setTimeout(() => {
			if (verificationInterval) clearInterval(verificationInterval);
			if (paymentStatus === 'pending') {
				setPaymentStatus('timeout');
				alert('Payment verification timed out. Please try again or contact support.');
			}
		}, 180000); // 3 minutes timeout
		
		// Initial check
		checkPaymentStatus();
	};
	
	if (loading) {
		return (
			<div className="text-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jungle-500 mx-auto mb-4"></div>
				<p>Loading course...</p>
			</div>
		);
	}

	if (!course) {
		return (
			<div className="text-center py-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
				<p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
				<Link 
					to="/courses" 
					className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle text-white hover:bg-jungle-600"
				>
					Back to Courses
				</Link>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto">
			{error && (
				<div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
					<p className="text-sm text-yellow-800">
						⚠️ Using offline data. Backend connection failed: {error}
					</p>
				</div>
			)}
			
			<div className="bg-white rounded-lg shadow-lg overflow-hidden group">
				<div className="relative overflow-hidden">
				<img 
					src={course.coverImage || course.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop'} 
					alt={course.title}
						className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
				/>
					<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
				</div>
				<div className="p-6">
					<div className="flex justify-between items-start mb-4">
						<h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
						<div className="text-right">
							<div className="text-2xl font-bold text-jungle-600">
								{course.isFree ? 'Free' : `Ksh ${course.price}`}
							</div>
						</div>
					</div>
					
					<p className="text-gray-600 mb-6">{course.description || course.desc}</p>
					
					<div className="mb-6">
						<h3 className="text-lg font-semibold mb-3 text-jungle-600">Course Content</h3>
						{course.lessons && course.lessons.length > 0 ? (
							<div className="space-y-2">
								{course.lessons.map((lesson, index) => (
									<div 
										key={lesson._id || index} 
										className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors ${
											(course.isFree || isEnrolled)
												? 'bg-gray-50 hover:bg-jungle-50 border border-gray-200 hover:border-jungle-300'
												: 'bg-gray-100'
										}`}
										onClick={() => (course.isFree || isEnrolled) && openLesson(lesson)}
									>
										<div>
											<div className="font-medium text-black">{lesson.title}</div>
											{lesson.duration && (
												<div className="text-sm text-gray-700">{lesson.duration}</div>
											)}
										</div>
										{(course.isFree || isEnrolled) ? (
											<span className="text-green-600 text-sm">✓ Click to open</span>
										) : (
											<span className="text-gray-400 text-sm">🔒 Locked</span>
										)}
									</div>
								))}
							</div>
						) : (
							<div className="space-y-2">
								<div className="flex items-center justify-between p-3 bg-gray-50 rounded">
									<div>
										<div className="font-medium text-black">Introduction to {course.title}</div>
										<div className="text-sm text-gray-700">15 minutes</div>
									</div>
									<span className="text-green-600 text-sm">✓ Available</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-gray-50 rounded">
									<div>
										<div className="font-medium text-black">Advanced Techniques</div>
										<div className="text-sm text-gray-700">20 minutes</div>
									</div>
									<span className="text-green-600 text-sm">✓ Available</span>
								</div>
								<div className="flex items-center justify-between p-3 bg-gray-50 rounded">
									<div>
										<div className="font-medium text-black">Practical Application</div>
										<div className="text-sm text-gray-700">25 minutes</div>
									</div>
									<span className="text-green-600 text-sm">✓ Available</span>
								</div>
							</div>
						)}
					</div>

					{/* Take Test button — shown for enrolled users on paid courses */}
					{isEnrolled && !course.isFree && (
						<div className="mb-6">
							<button
								onClick={() => setShowQuiz(true)}
								className="w-full py-3 bg-jungle-700 hover:bg-jungle-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
							>
								📝 Take Test
							</button>
						</div>
					)}

					{showQuiz && course._id && (
						<CourseQuiz courseId={course._id} onClose={() => setShowQuiz(false)} />
					)}

					{!isEnrolled && !course.isFree && !isAuthenticated && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<h4 className="font-semibold text-blue-800 mb-2">Login Required</h4>
							<p className="text-blue-700 text-sm">
								Please log in to enroll in paid courses and track your progress.
							</p>
							<div className="mt-3">
								<Link to="/login" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle-500 text-white hover:bg-jungle-600">
									Login
								</Link>
								<Link to="/register" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium border border-jungle-500 text-jungle-500 hover:bg-jungle-50 ml-2">
									Register
								</Link>
							</div>
						</div>
					)}

					{!isEnrolled && course.isFree && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
							<h4 className="font-semibold text-green-800 mb-2">Free Course - Start Learning!</h4>
							<p className="text-green-700 text-sm">
								This is a free course. Click enroll to get started and access all lessons!
							</p>
						</div>
					)}

					{!isEnrolled && !course.isFree && isAuthenticated && (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
							<h4 className="font-semibold text-yellow-800 mb-2">Course Access Required</h4>
							<p className="text-yellow-700 text-sm">
								This course requires payment. Click "Pay & Enroll" to proceed with M-Pesa payment.
							</p>
						</div>
					)}

					{isAdmin && !isEnrolled && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
							<h4 className="font-semibold text-red-800 mb-2">⚠️ Administrator Account</h4>
							<p className="text-red-700 text-sm">
								Administrators cannot enroll in courses. Please use a farmer account to enroll and access course content.
							</p>
						</div>
					)}

					{paymentStatus === 'pending' && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
									<div>
										<h4 className="font-semibold text-blue-800 mb-1">Payment in Progress</h4>
										<p className="text-blue-700 text-sm">
											M-Pesa payment prompt sent to your phone. Please check your phone to complete payment.
										</p>
										<p className="text-blue-600 text-xs mt-1">
											Reference: {paymentReference}
										</p>
									</div>
								</div>
								<button
									onClick={() => startPaymentVerification(paymentReference)}
									className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
								>
									Check Status
								</button>
							</div>
						</div>
					)}

					{paymentStatus === 'success' && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
							<div className="flex items-center">
								<div className="text-green-600 text-2xl mr-3">✅</div>
								<div>
									<h4 className="font-semibold text-green-800 mb-1">Payment Successful!</h4>
									<p className="text-green-700 text-sm">
										You are now enrolled in this course. The first lesson should open automatically.
									</p>
								</div>
							</div>
						</div>
					)}

					{paymentStatus === 'failed' && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
							<div className="flex items-center">
								<div className="text-red-600 text-2xl mr-3">❌</div>
								<div>
									<h4 className="font-semibold text-red-800 mb-1">Payment Failed</h4>
									<p className="text-red-700 text-sm">
										Your payment could not be processed. Please try again or contact support.
									</p>
									<button
										onClick={() => {
											setPaymentStatus(null);
											setPaymentReference(null);
											window.location.reload();
										}}
										className="mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
									>
										Try Again
									</button>
								</div>
							</div>
						</div>
					)}

					{paymentStatus === 'timeout' && (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
							<div className="flex items-center">
								<div className="text-yellow-600 text-2xl mr-3">⏰</div>
								<div>
									<h4 className="font-semibold text-yellow-800 mb-1">Payment Timeout</h4>
									<p className="text-yellow-700 text-sm">
										Payment verification timed out. Please check your payment status or try again.
									</p>
									<button
										onClick={() => {
											setPaymentStatus(null);
											setPaymentReference(null);
											window.location.reload();
										}}
										className="mt-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
									>
										Try Again
									</button>
								</div>
							</div>
						</div>
					)}

					<div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200">
						<div className="text-center mb-4">
							<h3 className="text-lg font-semibold text-gray-800 mb-2">
								{course.isFree ? 'Ready to Start Learning?' : 'Ready to Enroll?'}
							</h3>
							<p className="text-sm text-gray-600">
								{course.isFree 
									? 'This course is completely free. Click below to get started!'
									: `Get full access to this course for just Ksh ${course.price}`
								}
							</p>
			</div>

						<div className="flex flex-col sm:flex-row gap-4 items-center">
							
							<button
								onClick={handleEnroll}
								disabled={enrolling || isAdmin}
								className={`px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 transform hover:scale-105 ${
									course.isFree 
										? 'bg-jungle-500 hover:bg-jungle-600 text-white shadow-lg hover:shadow-xl' 
										: 'bg-jungle-500 hover:bg-jungle-600 text-white shadow-lg hover:shadow-xl border-4 border-jungle-700'
								} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
							>
								{enrolling ? (
									<span className="flex items-center gap-2">
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
										Processing...
									</span>
								) : course.isFree ? (
									'🎓 Enroll Free'
								) : (
									`📱 Pay Ksh ${course.price} with M-Pesa`
								)}
							</button>
							
							{isEnrolled && (
								<button
									onClick={() => navigate('/portal')}
									className="px-8 py-4 text-lg font-bold bg-jungle-500 text-white rounded-lg hover:bg-jungle-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
								>
									✅ Go to Portal
								</button>
							)}
							
							{!isEnrolled && course.isFree && (
								<button
									onClick={() => navigate('/portal')}
									className="px-8 py-4 text-lg font-bold bg-gray-500 text-white rounded-lg hover:bg-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
								>
									✅ Go to Portal
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

		</div>
	);
};

// Wrapper component to get the slug from URL params
function CourseDetailWrapper() {
  const { slug } = useParams();
  return <CourseDetail courseSlug={slug} />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'courses', element: <Courses /> },
      { 
        path: 'courses/:slug', 
        element: <CourseDetailWrapper /> 
      },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'admin', element: <Admin /> },
      { path: 'portal', element: <Portal /> },
      { path: 'payment-callback', element: <PaymentCallback /> },
    ],
  },
])

// Export all components for Fast Refresh
export { Login, Register, Admin, Portal, CourseGrid, CourseDetail, CourseDetailWrapper, PaymentCallback }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
