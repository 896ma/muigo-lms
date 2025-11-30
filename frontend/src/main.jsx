import { StrictMode, useState, useEffect, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useParams, useNavigate, Link } from 'react-router-dom'
import './index.css'
import AppLayout from './App.jsx'
import { apiGet } from './lib/api.js'

// Helper function to get API base URL
const getApiBaseUrl = () => {
	return import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://muigo-farmers-lms.onrender.com');
};

const Section = ({ title, children }) => (
	<section className="space-y-3">
		<h2 className="text-2xl font-semibold text-jungle">{title}</h2>
		<div className="text-gray-700">{children}</div>
	</section>
)

export { Section }

const Home = () => (
	<div className="space-y-8">
		<div className="bg-jungle text-white rounded-lg p-6">
			<h1 className="text-3xl font-bold">Welcome to Farmers LMS</h1>
			<p className="mt-2">Learn, grow, and thrive with free and premium courses.</p>
			<div className="mt-4 flex gap-3">
				<Link className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-white text-jungle hover:bg-jungle-50" to="/courses">Browse Courses</Link>
				<Link className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium border border-white text-white hover:bg-jungle-600" to="/register">Get Started</Link>
			</div>
		</div>
		<Section title="Popular Courses">
			<CourseGrid />
		</Section>
	</div>
)

export { Home }

const Courses = () => (
	<div className="space-y-6">
		<Section title="All Courses">
			<CourseGrid />
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
			<p>Sign in to access your account.</p>
			
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

			<form onSubmit={handleSubmit} className="mt-4 grid gap-3 max-w-md">
				<input 
					className="border rounded px-3 py-2" 
					placeholder="Email" 
					type="email" 
					name="email"
					value={formData.email}
					onChange={handleChange}
					required
				/>
				<input 
					className="border rounded px-3 py-2" 
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
					className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle-500 text-white hover:bg-jungle-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
		setLoading(true);
		setError('');
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
			<p>Create your account to access your learning dashboard.</p>
			
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

			<form onSubmit={handleSubmit} className="mt-4 grid gap-3 max-w-md">
				<input 
					className="border rounded px-3 py-2" 
					placeholder="Full Name" 
					name="name"
					value={formData.name}
					onChange={handleChange}
					required
				/>
				<input 
					className="border rounded px-3 py-2" 
					placeholder="Email" 
					type="email" 
					name="email"
					value={formData.email}
					onChange={handleChange}
					required
				/>
				<input 
					className="border rounded px-3 py-2" 
					placeholder="Password (min 6 characters)" 
					type="password" 
					name="password"
					value={formData.password}
					onChange={handleChange}
					required
					minLength="6"
				/>
				<input 
					className="border rounded px-3 py-2 text-black" 
					placeholder="Phone Number" 
					type="tel"
					name="phone"
					value={formData.phone}
					onChange={handleChange}
				/>
				<input 
					className="border rounded px-3 py-2" 
					placeholder="Farm Location" 
					type="text"
					name="farmLocation"
					value={formData.farmLocation}
					onChange={handleChange}
				/>
				<button 
					type="submit" 
					disabled={loading}
					className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle-500 text-white hover:bg-jungle-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
			} else {
				setIsAuthenticated(false);
			}
		} else {
			setIsAuthenticated(false);
		}
	}, []);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

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

	// User CRUD operations
	const createUser = async (userData) => {
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
				fetchUsers();
				setShowUserModal(false);
				resetUserForm();
				alert('User created successfully!');
			} else {
				alert('Error creating user: ' + data.message);
			}
		} catch (error) {
			console.error('Error creating user:', error);
			alert('Error creating user');
		}
	};

	const updateUser = async (userId, userData) => {
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
				fetchUsers();
				setShowUserModal(false);
				setEditingUser(null);
				resetUserForm();
				alert('User updated successfully!');
			} else {
				alert('Error updating user: ' + data.message);
			}
		} catch (error) {
			console.error('Error updating user:', error);
			alert('Error updating user');
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
				fetchUsers();
				alert('User deleted successfully!');
			} else {
				alert('Error deleting user: ' + data.message);
			}
		} catch (error) {
			console.error('Error deleting user:', error);
			alert('Error deleting user');
		}
	};

	// Course CRUD operations
	const createCourse = async (courseData) => {
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
				fetchCourses();
				setShowCourseModal(false);
				resetCourseForm();
				alert('Course created successfully!');
			} else {
				alert('Error creating course: ' + data.message);
			}
		} catch (error) {
			console.error('Error creating course:', error);
			alert('Error creating course');
		}
	};

	const updateCourse = async (courseId, courseData) => {
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
				fetchCourses();
				setShowCourseModal(false);
				setEditingCourse(null);
				resetCourseForm();
				alert('Course updated successfully!');
			} else {
				alert('Error updating course: ' + data.message);
			}
		} catch (error) {
			console.error('Error updating course:', error);
			alert('Error updating course');
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
				fetchCourses();
				alert('Course deleted successfully!');
			} else {
				alert('Error deleting course: ' + data.message);
			}
		} catch (error) {
			console.error('Error deleting course:', error);
			alert('Error deleting course');
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
		<div>
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold">Users Management</h3>
				<button
					onClick={() => openUserModal()}
					className="px-4 py-2 bg-jungle-500 text-white rounded hover:bg-jungle-600 transition-colors"
				>
					Add New User
				</button>
			</div>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farm Location</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{users.map((user) => (
							<tr key={user._id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{user.name}</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.email}</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.phone || 'N/A'}</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.farmLocation || 'N/A'}</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
										user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
									}`}>
										{user.role}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black">
									{new Date(user.createdAt).toLocaleDateString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() => openUserModal(user)}
											className="text-jungle-600 hover:text-jungle-900"
										>
											Edit
										</button>
										{user.role !== 'admin' && (
											<button
												onClick={() => deleteUser(user._id)}
												className="text-red-600 hover:text-red-900"
											>
												Delete
											</button>
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

	const CoursesTable = () => (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-lg font-semibold">Courses Management</h3>
				<button
					onClick={() => openCourseModal()}
					className="px-4 py-2 bg-jungle-500 text-white rounded hover:bg-jungle-600 transition-colors"
				>
					Add New Course
				</button>
			</div>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{courses.map((course) => (
							<tr key={course._id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{course.title}</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black">{course.category || 'N/A'}</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black">
									{course.isFree ? 'Free' : `${course.currency} ${course.price}`}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
										course.isFree ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
									}`}>
										{course.isFree ? 'Free' : 'Paid'}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-black">
									{new Date(course.createdAt).toLocaleDateString()}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
									<div className="flex space-x-2">
										<button
											onClick={() => viewCourse(course)}
											className="text-blue-600 hover:text-blue-900"
										>
											View
										</button>
										<button
											onClick={() => openCourseModal(course)}
											className="text-jungle-600 hover:text-jungle-900"
										>
											Edit
										</button>
										<button
											onClick={() => deleteCourse(course._id)}
											className="text-red-600 hover:text-red-900"
										>
											Delete
										</button>
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
		return (
			<Section title="Admin Dashboard">
				<div className="text-center py-8">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						<strong>Access Denied:</strong> Admin authentication required
					</div>
					<p className="text-gray-600 mb-4">You need to be logged in as an admin to access this page.</p>
					<div className="space-x-4">
						<Link to="/login" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle-500 text-white hover:bg-jungle-600">
							Login
						</Link>
					</div>
				</div>
			</Section>
		);
	}

	return (
		<Section title="Admin Dashboard">
			<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between items-center">
				<div>
					Welcome back, {user?.name}! You are logged in as an administrator.
				</div>
				<button
					onClick={() => {
						localStorage.removeItem('token');
						localStorage.removeItem('user');
						window.location.href = '/login';
					}}
					className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
				>
					Logout
				</button>
			</div>
			
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div className="rounded border p-4 bg-white">
					<div className="text-sm text-gray-500">Total Users</div>
					<div className="text-2xl font-semibold text-jungle-500">{stats.totalUsers}</div>
				</div>
				<div className="rounded border p-4 bg-white">
					<div className="text-sm text-gray-500">Total Courses</div>
					<div className="text-2xl font-semibold text-jungle-500">{stats.totalCourses}</div>
				</div>
				<div className="rounded border p-4 bg-white">
					<div className="text-sm text-gray-500">Total Enrollments</div>
					<div className="text-2xl font-semibold text-jungle-500">{stats.totalEnrollments}</div>
				</div>
				<div className="rounded border p-4 bg-white">
					<div className="text-sm text-gray-500">Active Learners</div>
					<div className="text-2xl font-semibold text-jungle-500">{stats.activeUsers}</div>
				</div>
			</div>
			
			{loading ? (
				<div className="text-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jungle-500 mx-auto mb-4"></div>
					<p>Loading data...</p>
				</div>
			) : (
				<Tabs tabs={[
					{ label: 'Courses', content: <CoursesTable /> },
					{ label: 'Users', content: <UsersTable /> },
					{ label: 'Payments', content: <div>Payments table (coming soon)</div> },
				]} />
			)}

			{/* User Modal */}
			{showUserModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h3 className="text-lg font-semibold mb-4">
							{editingUser ? 'Edit User' : 'Add New User'}
						</h3>
						<form onSubmit={handleUserSubmit}>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700">Name</label>
									<input
										type="text"
										value={userForm.name}
										onChange={(e) => setUserForm({...userForm, name: e.target.value})}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Email</label>
									<input
										type="email"
										value={userForm.email}
										onChange={(e) => setUserForm({...userForm, email: e.target.value})}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Phone</label>
									<input
										type="text"
										value={userForm.phone}
										onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Farm Location</label>
									<input
										type="text"
										value={userForm.farmLocation}
										onChange={(e) => setUserForm({...userForm, farmLocation: e.target.value})}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Role</label>
									<select
										value={userForm.role}
										onChange={(e) => setUserForm({...userForm, role: e.target.value})}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
									>
										<option value="farmer">Farmer</option>
										<option value="admin">Admin</option>
									</select>
								</div>
							</div>
							<div className="flex justify-end space-x-2 mt-6">
								<button
									type="button"
									onClick={() => setShowUserModal(false)}
									className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-jungle-500 text-white rounded-md hover:bg-jungle-600"
								>
									{editingUser ? 'Update' : 'Create'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Course Modal */}
			{showCourseModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<h3 className="text-lg font-semibold mb-4">
							{editingCourse ? 'Edit Course' : 'Add New Course'}
						</h3>
						<form onSubmit={handleCourseSubmit}>
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700">Title</label>
									<input
										type="text"
										value={courseForm.title}
										onChange={(e) => setCourseForm({...courseForm, title: e.target.value})}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700">Description</label>
									<textarea
										value={courseForm.description}
										onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
										className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
										rows="3"
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">Category</label>
										<input
											type="text"
											value={courseForm.category}
											onChange={(e) => setCourseForm({...courseForm, category: e.target.value})}
											className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">Cover Image URL</label>
										<input
											type="url"
											value={courseForm.coverImage}
											onChange={(e) => setCourseForm({...courseForm, coverImage: e.target.value})}
											className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
										/>
									</div>
								</div>
								<div className="grid grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">Price</label>
										<input
											type="number"
											value={courseForm.price}
											onChange={(e) => setCourseForm({...courseForm, price: parseFloat(e.target.value) || 0})}
											className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
											min="0"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">Currency</label>
										<select
											value={courseForm.currency}
											onChange={(e) => setCourseForm({...courseForm, currency: e.target.value})}
											className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
										>
											<option value="KES">KES</option>
											<option value="USD">USD</option>
										</select>
									</div>
									<div className="flex items-center">
										<label className="flex items-center">
											<input
												type="checkbox"
												checked={courseForm.isFree}
												onChange={(e) => setCourseForm({...courseForm, isFree: e.target.checked})}
												className="mr-2"
											/>
											<span className="text-sm font-medium text-gray-700">Free Course</span>
										</label>
									</div>
								</div>
							</div>
							<div className="flex justify-end space-x-2 mt-6">
								<button
									type="button"
									onClick={() => setShowCourseModal(false)}
									className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-jungle-500 text-white rounded-md hover:bg-jungle-600"
								>
									{editingCourse ? 'Update' : 'Create'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Course View Modal */}
			{showCourseViewModal && viewingCourse && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Course Details</h3>
							<button
								onClick={() => setShowCourseViewModal(false)}
								className="text-gray-400 hover:text-gray-600"
							>
								<span className="sr-only">Close</span>
								<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<h4 className="font-semibold text-gray-700">Title</h4>
									<p className="text-gray-900">{viewingCourse.title}</p>
								</div>
								<div>
									<h4 className="font-semibold text-gray-700">Category</h4>
									<p className="text-gray-900">{viewingCourse.category || 'N/A'}</p>
								</div>
							</div>
							<div>
								<h4 className="font-semibold text-gray-700">Description</h4>
								<p className="text-gray-900">{viewingCourse.description || 'No description available'}</p>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<h4 className="font-semibold text-gray-700">Price</h4>
									<p className="text-gray-900">
										{viewingCourse.isFree ? 'Free' : `${viewingCourse.currency} ${viewingCourse.price}`}
									</p>
								</div>
								<div>
									<h4 className="font-semibold text-gray-700">Status</h4>
									<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
										viewingCourse.isFree ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
									}`}>
										{viewingCourse.isFree ? 'Free' : 'Paid'}
									</span>
								</div>
								<div>
									<h4 className="font-semibold text-gray-700">Created</h4>
									<p className="text-gray-900">{new Date(viewingCourse.createdAt).toLocaleDateString()}</p>
								</div>
							</div>
							{viewingCourse.coverImage && (
								<div>
									<h4 className="font-semibold text-gray-700">Cover Image</h4>
									<img
										src={viewingCourse.coverImage}
										alt={viewingCourse.title}
										className="mt-2 w-full h-48 object-cover rounded-lg border"
										onError={(e) => {
											e.target.style.display = 'none';
										}}
									/>
								</div>
							)}
							{viewingCourse.lessons && viewingCourse.lessons.length > 0 && (
								<div>
									<h4 className="font-semibold text-gray-700">Lessons ({viewingCourse.lessons.length})</h4>
									<div className="mt-2 space-y-2">
										{viewingCourse.lessons.map((lesson, index) => (
											<div key={index} className="p-3 bg-gray-50 rounded-lg">
												<h5 className="font-medium text-gray-900">{lesson.title}</h5>
												{lesson.description && (
													<p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
												)}
												{lesson.videoUrl && (
													<p className="text-xs text-blue-600 mt-1">Video: {lesson.videoUrl}</p>
												)}
											</div>
										))}
									</div>
								</div>
							)}
						</div>
						<div className="flex justify-end mt-6">
							<button
								onClick={() => setShowCourseViewModal(false)}
								className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
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

import ProgressBar from './components/ProgressBar.jsx'
import PaymentCallback from './components/PaymentCallback.jsx'

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
				<div className="rounded border p-4 bg-white">
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
								<div key={enrollment._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
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
		title: 'Soil Health Basics', 
		price: 0, 
		isFree: true, 
		image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Build fertile soil for resilient, high-yield crops.',
		slug: 'soil-health-basics'
	},
	{ 
		id: 2, 
		title: 'Irrigation 101', 
		price: 49, 
		isFree: false, 
		image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Design efficient watering systems to save water and time.',
		slug: 'irrigation-101'
	},
	{ 
		id: 3, 
		title: 'Organic Pest Control', 
		price: 39, 
		isFree: false, 
		image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Protect your farm using safe, sustainable methods.',
		slug: 'organic-pest-control'
	},
	{ 
		id: 4, 
		title: 'Advanced Crop Management', 
		price: 29, 
		isFree: false, 
		image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Master advanced techniques for maximizing crop yields and quality.',
		slug: 'advanced-crop-management'
	},
	{ 
		id: 5, 
		title: 'Sustainable Farming Practices', 
		price: 35, 
		isFree: false, 
		image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Learn sustainable farming methods for long-term success.',
		slug: 'sustainable-farming-practices'
	},
	{ 
		id: 6, 
		title: 'Market Readiness', 
		price: 0, 
		isFree: true, 
		image: 'https://images.unsplash.com/photo-1524594081293-190a2fe0baae?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Package, price, and sell produce with confidence.',
		slug: 'market-readiness'
	},
]

function CourseGrid() {
	const [courses, setCourses] = useState(placeholderCourses); // Start with placeholder data
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [usingAPI, setUsingAPI] = useState(false);

	useEffect(() => {
		loadCourses();
	}, []);

	const loadCourses = async () => {
		try {
			setLoading(true);
			setError(null);
		// Fetching courses from API
			
			// Try to fetch from API with a longer timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
			
			const data = await apiGet('/api/courses', { signal: controller.signal });
			clearTimeout(timeoutId);
			
			if (data && data.length > 0) {
				setCourses(data);
				setUsingAPI(true);
			} else {
				setCourses(placeholderCourses);
				setUsingAPI(false);
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
		} finally {
			setLoading(false);
		}
	};

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
			
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				{courses.map(course => (
					<div key={course._id || course.id} className="border rounded-lg overflow-hidden bg-white transition-colors hover:bg-jungle-50 group">
						<div className="relative overflow-hidden">
						<img 
							src={course.coverImage || course.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop'} 
							alt={course.title} 
								className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105" 
						/>
							<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
						</div>
						<div className="p-4 space-y-2">
							<h3 className="font-semibold">{course.title}</h3>
							{(course.description || course.desc) && (
								<p className="text-sm text-gray-600">{course.description || course.desc}</p>
							)}
							<div className="text-sm text-gray-600">
								{course.isFree ? 'Free' : `Ksh ${course.price}`}
							</div>
							<Link 
								to={`/courses/${course.slug}`}
								className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium border border-jungle-500 text-jungle-500 hover:bg-jungle-50"
							>
								View
							</Link>
						</div>
					</div>
				))}
			</div>
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
