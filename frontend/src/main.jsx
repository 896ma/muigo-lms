import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom'
import './index.css'
import AppLayout from './App.jsx'
import { apiGet } from './lib/api.js'

// Helper function to get API base URL
const getApiBaseUrl = () => {
	return import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:5000');
};

const Section = ({ title, children }) => (
	<section className="space-y-3">
		<h2 className="text-2xl font-semibold text-jungle">{title}</h2>
		<div className="text-gray-700">{children}</div>
	</section>
)

const Home = () => (
	<div className="space-y-8">
		<div className="bg-jungle text-white rounded-lg p-6">
			<h1 className="text-3xl font-bold">Welcome to Farmers LMS</h1>
			<p className="mt-2">Learn, grow, and thrive with free and premium courses.</p>
			<div className="mt-4 flex gap-3">
				<a className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-white text-jungle hover:bg-jungle-50" href="/courses">Browse Courses</a>
				<a className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium border border-white text-white hover:bg-jungle-600" href="/register">Get Started</a>
			</div>
		</div>
		<Section title="Popular Courses">
			<CourseGrid />
		</Section>
	</div>
)

const Courses = () => (
	<div className="space-y-6">
		<Section title="All Courses">
			<CourseGrid />
		</Section>
	</div>
)

const Login = () => {
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
					window.location.href = '/admin';
				} else {
					window.location.href = '/portal';
				}
			} else {
				setError(data.message || 'Login failed');
			}
		} catch (err) {
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
		} catch (err) {
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
					className="border rounded px-3 py-2" 
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
	const [loading, setLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState(null);

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = () => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');
		
		if (token && userData) {
			const parsedUser = JSON.parse(userData);
			if (parsedUser.role === 'admin') {
				setIsAuthenticated(true);
				setUser(parsedUser);
				fetchStats();
				fetchUsers();
			} else {
				setIsAuthenticated(false);
			}
		} else {
			setIsAuthenticated(false);
		}
	};

	const fetchStats = async () => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/admin/stats`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			const data = await response.json();
			setStats(data);
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

	const UsersTable = () => (
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
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{users.map((user) => (
						<tr key={user._id}>
							<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || 'N/A'}</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.farmLocation || 'N/A'}</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
									user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
								}`}>
									{user.role}
								</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{new Date(user.createdAt).toLocaleDateString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
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
						<a href="/login" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle-500 text-white hover:bg-jungle-600">
							Login
						</a>
						<a href="/register" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium border border-jungle-500 text-jungle-500 hover:bg-jungle-50">
							Register
						</a>
					</div>
				</div>
			</Section>
		);
	}

	return (
		<Section title="Admin Dashboard">
			<div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
				Welcome back, {user?.name}! You are logged in as an administrator.
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

	useEffect(() => {
		checkAuth();
	}, []);

	const checkAuth = () => {
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
	};

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
				console.log('Enrollments fetched:', data);
				console.log('Number of enrollments:', data.length);
				console.log('Enrollment details:', data.map(e => ({
					id: e._id,
					courseTitle: e.course?.title,
					enrolledAt: e.enrolledAt,
					status: e.status
				})));
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

	if (!isAuthenticated) {
		return (
			<Section title="Farmer Portal">
				<div className="text-center py-8">
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
						<strong>Access Required:</strong> Please log in to access your farmer portal
					</div>
					<p className="text-gray-600 mb-4">Sign in to view your enrolled courses and track your progress.</p>
					<div className="space-x-4">
						<a href="/login" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle-500 text-white hover:bg-jungle-600">
							Login
						</a>
						<a href="/register" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium border border-jungle-500 text-jungle-500 hover:bg-jungle-50">
							Register
						</a>
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
						<div className="space-y-3">
							{enrollments.map((enrollment) => (
								<div key={enrollment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-jungle-50 transition-colors">
									<div className="flex-1">
										<span className="font-medium text-lg">{enrollment.course?.title || 'Course Title'}</span>
										<div className="text-sm text-gray-500 mt-1">
											Enrolled: {new Date(enrollment.enrolledAt || enrollment.startedAt).toLocaleDateString()}
										</div>
										{enrollment.course?.description && (
											<div className="text-sm text-gray-600 mt-1">
												{enrollment.course.description.substring(0, 100)}...
											</div>
										)}
									</div>
									<div className="flex items-center gap-3">
										<ProgressBar value={enrollment.progress || 0} />
										<span className="text-sm text-gray-600 font-medium">{enrollment.progress || 0}%</span>
										<a 
											href={`/courses/${enrollment.course?.slug}`}
											className="px-3 py-1 bg-jungle-500 text-white text-sm rounded hover:bg-jungle-600 transition-colors"
										>
											Continue
										</a>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<p>You haven't enrolled in any courses yet.</p>
							<a href="/courses" className="text-jungle-500 hover:underline">Browse available courses</a>
						</div>
					)}
				</div>
			</div>
		</Section>
	)
}

function CoursesTable() {
	return (
		<div className="overflow-x-auto">
			<table className="min-w-full text-sm">
				<thead>
					<tr className="text-left text-gray-600">
						<th className="p-2">Title</th>
						<th className="p-2">Price</th>
						<th className="p-2">Status</th>
						<th className="p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
					{placeholderCourses.map(c => (
						<tr key={c.id} className="border-t">
							<td className="p-2">{c.title}</td>
							<td className="p-2">{c.price}</td>
							<td className="p-2">Published</td>
							<td className="p-2">
								<button className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium border border-jungle text-jungle hover:bg-jungle-50">Edit</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
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
		price: 50, 
		isFree: false, 
		image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Design efficient watering systems to save water and time.',
		slug: 'irrigation-101'
	},
	{ 
		id: 3, 
		title: 'Organic Pest Control', 
		price: 50, 
		isFree: false, 
		image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Protect your farm using safe, sustainable methods.',
		slug: 'organic-pest-control'
	},
	{ 
		id: 4, 
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
			console.log('Attempting to fetch courses from API...');
			console.log('API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000');
			
			// Try to fetch from API with a longer timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
			
			const data = await apiGet('/api/courses', { signal: controller.signal });
			clearTimeout(timeoutId);
			
			console.log('Courses fetched from API:', data);
			if (data && data.length > 0) {
				setCourses(data);
				setUsingAPI(true);
				console.log('Successfully loaded courses from API');
			} else {
				console.log('API returned empty data, using placeholders');
				setCourses(placeholderCourses);
				setUsingAPI(false);
			}
		} catch (err) {
			console.error('Error fetching courses from API:', err);
			console.error('Error details:', {
				message: err.message,
				name: err.name,
				stack: err.stack
			});
			setError(err.message);
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
							<a 
								href={`/courses/${course.slug}`}
								className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium border border-jungle-500 text-jungle-500 hover:bg-jungle-50"
							>
								View
							</a>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

// CourseDetail component that fetches from API
const CourseDetail = ({ courseSlug }) => {
	const [course, setCourse] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [enrolling, setEnrolling] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState('');
	const [isEnrolled, setIsEnrolled] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [showPaymentOptions, setShowPaymentOptions] = useState(false);
	const [paymentStatus, setPaymentStatus] = useState(null);
	const [paymentReference, setPaymentReference] = useState(null);

	useEffect(() => {
		loadCourse();
		checkAuthStatus();
	}, [courseSlug, isAuthenticated]);

	const checkAuthStatus = () => {
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');
		setIsAuthenticated(!!(token && userData));
	};

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
						console.log('Enrollment response:', data);
						alert(data.message || 'Successfully enrolled in free course!');
						setIsEnrolled(true);
						
						// Refresh enrollments if portal is open and user is logged in
						if (refreshEnrollments && token) {
							console.log('Refreshing enrollments...');
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
				} catch (err) {
					console.error('Enrollment error:', err);
					alert('Enrollment failed. Please try again or contact support.');
				}
			} else {
				// Paid course - show payment options
				if (!isAuthenticated) {
					alert('Please log in to enroll in paid courses. You will be redirected to the login page.');
					window.location.href = '/login';
					return;
				}

				setShowPaymentOptions(true);
			}
		} catch (err) {
			alert('Enrollment failed: ' + err.message);
		} finally {
			setEnrolling(false);
		}
	};

	const handleMpesaPayment = async () => {
		if (!phoneNumber) {
			alert('Please enter your phone number for M-Pesa payment');
			return;
		}

		try {
			setEnrolling(true);
			console.log('Initializing M-Pesa payment for course:', course._id, 'with phone:', phoneNumber);
			const token = localStorage.getItem('token');
			const response = await fetch(`${getApiBaseUrl()}/api/payments/initialize`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					courseId: course._id,
					phoneNumber: phoneNumber
				})
			});
			
			if (response.ok) {
				const paymentData = await response.json();
				console.log('M-Pesa payment data received:', paymentData);
				
				// Store payment reference for verification
				setPaymentReference(paymentData.reference);
				setPaymentStatus('pending');
				setShowPaymentOptions(false);
				
				// Check if we have a redirect URL for M-Pesa authorization
				if (paymentData.redirect_url || paymentData.authorization_url) {
					const authUrl = paymentData.redirect_url || paymentData.authorization_url;
					console.log('Redirecting to M-Pesa authorization URL:', authUrl);
					
					// Open M-Pesa authorization page in a new window
					window.open(authUrl, '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
					
					// Show message to user
					alert('M-Pesa payment page opened. Please complete the payment on the new page. You will be redirected back here once payment is complete.');
					
					// Start polling for payment status
					startPaymentVerification(paymentData.reference);
				} else {
					// Fallback message
					alert(paymentData.message || 'M-Pesa payment initialized. Please check your phone to complete payment.');
					
					// Start polling for payment status
					startPaymentVerification(paymentData.reference);
				}
			} else {
				const errorData = await response.json();
				console.error('M-Pesa payment error response:', errorData);
				throw new Error(errorData.message || 'M-Pesa payment initialization failed');
			}
		} catch (err) {
			console.error('M-Pesa payment initialization error:', err);
			alert('M-Pesa payment initialization failed: ' + err.message);
		} finally {
			setEnrolling(false);
		}
	};

	const startPaymentVerification = (reference) => {
		const checkPaymentStatus = async () => {
			try {
				const token = localStorage.getItem('token');
				const response = await fetch(`${getApiBaseUrl()}/api/payments/verify`, {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ reference })
				});

				if (response.ok) {
					const data = await response.json();
					console.log('Payment verification response:', data);
					
					if (data.message && data.message.includes('successful')) {
						setPaymentStatus('success');
						setIsEnrolled(true);
						alert('Payment successful! You are now enrolled in the course.');
						
						// Refresh enrollments if portal is open
						if (refreshEnrollments) {
							refreshEnrollments();
						}
						
						// Clear payment status
						setPaymentReference(null);
						setPaymentStatus(null);
					} else if (data.status === 'pending') {
						// Payment is still pending, continue waiting
						console.log('Payment still pending...');
					}
				}
			} catch (error) {
				console.error('Payment verification error:', error);
			}
		};

		// Check payment status every 5 seconds for 2 minutes
		const interval = setInterval(checkPaymentStatus, 5000);
		setTimeout(() => {
			clearInterval(interval);
			if (paymentStatus === 'pending') {
				setPaymentStatus('timeout');
				alert('Payment verification timed out. Please try again or contact support.');
			}
		}, 120000); // 2 minutes timeout
	};

	const loadCourse = async () => {
		try {
			setLoading(true);
			setError(null);
			console.log(`Attempting to fetch course: ${courseSlug}`);
			
			const data = await apiGet(`/api/courses/${courseSlug}`);
			console.log('Course fetched from API:', data);
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
				} catch (err) {
					console.error('Error checking enrollment:', err);
					setIsEnrolled(false);
				}
			} else {
				// Not authenticated and not free course
				setIsEnrolled(false);
			}
		} catch (err) {
			console.error('Error fetching course from API:', err);
			setError(err.message);
			// Fallback to placeholder data
			const fallbackCourse = placeholderCourses.find(c => c.slug === courseSlug);
			setCourse(fallbackCourse);
			if (fallbackCourse && fallbackCourse.isFree) {
				setIsEnrolled(true);
			}
		} finally {
			setLoading(false);
		}
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
				<a 
					href="/courses" 
					className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle text-white hover:bg-jungle-600"
				>
					Back to Courses
				</a>
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
								<a href="/login" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle-500 text-white hover:bg-jungle-600">
									Login
								</a>
								<a href="/register" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium border border-jungle-500 text-jungle-500 hover:bg-jungle-50 ml-2">
									Register
								</a>
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
								disabled={enrolling}
								className={`px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 transform hover:scale-105 ${
									course.isFree 
										? 'bg-jungle-500 hover:bg-jungle-600 text-white shadow-lg hover:shadow-xl' 
										: 'bg-jungle-500 hover:bg-jungle-600 text-white shadow-lg hover:shadow-xl border-4 border-jungle-700'
								} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
							>
								{enrolling ? (
									<span className="flex items-center gap-2">
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
										Processing...
									</span>
								) : course.isFree ? (
									'🎓 Enroll Free'
								) : (
									`💳 Pay Ksh ${course.price} & Enroll`
								)}
							</button>
							
							{isEnrolled && (
								<button
									onClick={() => window.location.href = '/portal'}
									className="px-8 py-4 text-lg font-bold bg-jungle-500 text-white rounded-lg hover:bg-jungle-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
								>
									✅ Go to Portal
								</button>
							)}
							
							{!isEnrolled && course.isFree && (
								<button
									onClick={() => window.location.href = '/portal'}
									className="px-8 py-4 text-lg font-bold bg-gray-500 text-white rounded-lg hover:bg-gray-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
								>
									✅ Go to Portal
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Payment Options Modal */}
			{showPaymentOptions && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Choose Payment Method</h3>
							<button
								onClick={() => setShowPaymentOptions(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								✕
							</button>
						</div>
						
						<div className="mb-4">
							<p className="text-gray-600 mb-2">Course: <strong>{course.title}</strong></p>
							<p className="text-gray-600 mb-4">Amount: <strong>Ksh {course.price}</strong></p>
						</div>

						{/* M-Pesa Payment Option */}
						<div className="border border-gray-200 rounded-lg p-4 mb-4">
							<div className="flex items-center mb-3">
								<div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
									<img 
										src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=40&h=40&fit=crop&crop=center" 
										alt="M-Pesa" 
										className="w-8 h-8 rounded"
										onError={(e) => {
											e.target.style.display = 'none';
											e.target.nextSibling.style.display = 'block';
										}}
									/>
									<span className="text-white font-bold text-lg" style={{display: 'none'}}>M</span>
								</div>
								<div>
									<h4 className="font-semibold text-gray-800">M-Pesa Mobile Money</h4>
									<p className="text-sm text-gray-600">Pay using your M-Pesa account</p>
								</div>
							</div>
							
							<div className="mb-3">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Phone Number
								</label>
								<input
									type="tel"
									placeholder="07XX XXX XXX"
									value={phoneNumber}
									onChange={(e) => setPhoneNumber(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
								/>
								<p className="text-xs text-gray-500 mt-1">Enter your M-Pesa registered phone number</p>
							</div>
							
							<button
								onClick={handleMpesaPayment}
								disabled={enrolling || !phoneNumber}
								className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{enrolling ? 'Processing...' : 'Pay with M-Pesa'}
							</button>
						</div>

						{/* Additional Mobile Money Options */}
						<div className="text-center text-sm text-gray-500 mb-4">
							<p>Other mobile money options available through Paystack:</p>
							<div className="flex justify-center space-x-4 mt-2">
								<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Airtel Money</span>
								<span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">T-Kash</span>
								<span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Equitel</span>
							</div>
						</div>

						<div className="text-center">
							<button
								onClick={() => setShowPaymentOptions(false)}
								className="text-gray-500 hover:text-gray-700 text-sm"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
