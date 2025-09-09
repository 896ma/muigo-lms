import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
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
			<button type="button" className="btn btn-primary">Register</button>
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
	{ id: 1, title: 'Soil Health Basics', price: 'Free', image: 'https://images.unsplash.com/photo-1500937386664-56b8b85b0a42?q=80&w=1200&auto=format&fit=crop' },
	{ id: 2, title: 'Irrigation 101', price: '$15', image: 'https://images.unsplash.com/photo-1597047084890-1ff28efc7170?q=80&w=1200&auto=format&fit=crop' },
	{ id: 3, title: 'Organic Pest Control', price: '$12', image: 'https://images.unsplash.com/photo-1457530378978-8bac673b8062?q=80&w=1200&auto=format&fit=crop' },
	{ id: 4, title: 'Market Readiness', price: 'Free', image: 'https://images.unsplash.com/photo-1500631195310-2021c24a076b?q=80&w=1200&auto=format&fit=crop' },
]

function CourseGrid() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
			{placeholderCourses.map(c => (
				<div key={c.id} className="border rounded-lg overflow-hidden bg-white">
					<img src={c.image} alt="course" className="h-40 w-full object-cover" />
					<div className="p-4 space-y-2">
						<h3 className="font-semibold">{c.title}</h3>
						<div className="text-sm text-gray-600">{c.price}</div>
						<button className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium border border-jungle text-jungle hover:bg-jungle-50">View</button>
					</div>
				</div>
			))}
		</div>
	)
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'courses', element: <Courses /> },
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
