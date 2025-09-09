import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom'
import './index.css'
import AppLayout from './App.jsx'

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

const Register = () => (
	<Section title="Register">
		<p>Create your account to access your learning dashboard.</p>
		<form className="mt-4 grid gap-3 max-w-md">
			<input className="border rounded px-3 py-2" placeholder="Name" />
			<input className="border rounded px-3 py-2" placeholder="Email" type="email" />
			<input className="border rounded px-3 py-2" placeholder="Password" type="password" />
			<button type="button" className="inline-flex items-center gap-2 rounded-md px-4 py-2 font-medium bg-jungle text-white hover:bg-jungle-600">Register</button>
		</form>
	</Section>
)

import Tabs from './components/Tabs.jsx'

const Admin = () => (
	<Section title="Admin Dashboard">
		<div className="grid grid-cols-2 gap-4 mb-4">
			<div className="rounded border p-4">
				<div className="text-sm text-gray-500">Total Courses</div>
				<div className="text-2xl font-semibold">24</div>
			</div>
			<div className="rounded border p-4">
				<div className="text-sm text-gray-500">Active Learners</div>
				<div className="text-2xl font-semibold">312</div>
			</div>
		</div>
		<Tabs tabs={[
			{ label: 'Courses', content: <CoursesTable /> },
			{ label: 'Users', content: <div>Users table (coming soon)</div> },
			{ label: 'Payments', content: <div>Payments table (coming soon)</div> },
		]} />
	</Section>
)

import ProgressBar from './components/ProgressBar.jsx'

const Portal = () => (
	<Section title="Farmer Portal">
		<div className="space-y-4">
			{placeholderCourses.slice(0,3).map((c, idx) => (
				<div key={c.id} className="flex items-center gap-4 border rounded p-3">
					<img src={c.image} className="h-16 w-24 object-cover rounded" />
					<div className="flex-1">
						<div className="font-medium">{c.title}</div>
						<ProgressBar value={[20,55,80][idx]} />
					</div>
					<button className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium border border-jungle text-jungle hover:bg-jungle-50">Continue</button>
				</div>
			))}
		</div>
	</Section>
)

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

const placeholderCourses = [
	{ 
		id: 1, 
		title: 'Soil Health Basics', 
		price: 'Free', 
		isFree: true, 
		image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Build fertile soil for resilient, high-yield crops.',
		slug: 'soil-health-basics'
	},
	{ 
		id: 2, 
		title: 'Irrigation 101', 
		price: 'Ksh 50', 
		isFree: false, 
		image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Design efficient watering systems to save water and time.',
		slug: 'irrigation-101'
	},
	{ 
		id: 3, 
		title: 'Organic Pest Control', 
		price: 'Ksh 50', 
		isFree: false, 
		image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Protect your farm using safe, sustainable methods.',
		slug: 'organic-pest-control'
	},
	{ 
		id: 4, 
		title: 'Market Readiness', 
		price: 'Free', 
		isFree: true, 
		image: 'https://images.unsplash.com/photo-1524594081293-190a2fe0baae?q=80&w=1600&auto=format&fit=crop', 
		desc: 'Package, price, and sell produce with confidence.',
		slug: 'market-readiness'
	},
]

function CourseGrid() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
			{placeholderCourses.map(course => (
				<div key={course.id} className="border rounded-lg overflow-hidden bg-white transition-colors hover:bg-jungle-50">
					<img 
						src={course.image} 
						alt={course.title} 
						className="h-40 w-full object-cover" 
					/>
					<div className="p-4 space-y-2">
						<h3 className="font-semibold">{course.title}</h3>
						{course.desc && <p className="text-sm text-gray-600">{course.desc}</p>}
						<div className="text-sm text-gray-600">
							{course.isFree ? 'Free' : course.price}
						</div>
						<a 
							href={`/courses/${course.slug}`}
							className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium border border-jungle text-jungle hover:bg-jungle-50"
						>
							View
						</a>
					</div>
				</div>
			))}
		</div>
	)
}

// Simple CourseDetail component for now
const CourseDetail = ({ courseSlug }) => {
	const course = placeholderCourses.find(c => c.slug === courseSlug);
	
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
			<div className="bg-white rounded-lg shadow-lg overflow-hidden">
				<img 
					src={course.image} 
					alt={course.title}
					className="w-full h-64 object-cover"
				/>
				<div className="p-6">
					<div className="flex justify-between items-start mb-4">
						<h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
						<div className="text-right">
							<div className="text-2xl font-bold text-jungle-600">
								{course.isFree ? 'Free' : course.price}
							</div>
						</div>
					</div>
					
					<p className="text-gray-600 mb-6">{course.desc}</p>
					
					<div className="mb-6">
						<h3 className="text-lg font-semibold mb-3">Course Content</h3>
						<div className="space-y-2">
							<div className="flex items-center justify-between p-3 bg-gray-50 rounded">
								<div>
									<div className="font-medium">Introduction to {course.title}</div>
									<div className="text-sm text-gray-500">15 minutes</div>
								</div>
								<span className="text-green-600 text-sm">✓ Available</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-gray-50 rounded">
								<div>
									<div className="font-medium">Advanced Techniques</div>
									<div className="text-sm text-gray-500">20 minutes</div>
								</div>
								<span className="text-green-600 text-sm">✓ Available</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-gray-50 rounded">
								<div>
									<div className="font-medium">Practical Application</div>
									<div className="text-sm text-gray-500">25 minutes</div>
								</div>
								<span className="text-green-600 text-sm">✓ Available</span>
							</div>
						</div>
					</div>

					<div className="flex gap-4">
						<button className="px-6 py-2 bg-jungle-600 text-white rounded-md hover:bg-jungle-700">
							{course.isFree ? 'Enroll Free' : 'Pay & Enroll'}
						</button>
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
      { path: 'register', element: <Register /> },
      { path: 'admin', element: <Admin /> },
      { path: 'portal', element: <Portal /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
