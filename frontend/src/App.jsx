import { Outlet, Link } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import { useState, useMemo } from 'react'

function Navbar({ isDark }) {
	const hoverClass = 'hover:bg-jungle-700'
	return (
		<nav className="border-b bg-jungle-800 border-jungle-600">
			<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
				<Link to="/" className="text-white font-bold text-lg">Farmers LMS</Link>
				<div className="flex items-center gap-2">
					<ul className="flex gap-1 text-sm">
						<li><Link to="/" className={`px-2 py-1 rounded ${hoverClass} text-gray-100 hover:text-white`}>Home</Link></li>
						<li><Link to="/courses" className={`px-2 py-1 rounded ${hoverClass} text-gray-100 hover:text-white`}>Courses</Link></li>
						<li><Link to="/login" className={`px-2 py-1 rounded ${hoverClass} text-gray-100 hover:text-white`}>Login</Link></li>
						<li><Link to="/register" className={`px-2 py-1 rounded ${hoverClass} text-gray-100 hover:text-white`}>Register</Link></li>
						<li><Link to="/admin" className={`px-2 py-1 rounded ${hoverClass} text-gray-100 hover:text-white`}>Admin</Link></li>
					</ul>
				</div>
			</div>
		</nav>
	)
} 

export default function AppLayout() {
	const [isDark] = useState(false)
	const containerClass = useMemo(() => isDark 
		? 'min-h-screen text-gray-100 bg-gradient-to-b from-jungle-900 via-jungle-800 to-gray-950'
		: 'min-h-screen text-gray-100 bg-gradient-to-b from-jungle-900 via-jungle-800 to-gray-950'
	, [isDark])
	return (
		<div className={containerClass}>
			<Navbar isDark={isDark} />
			<main className="max-w-6xl mx-auto px-4 py-8">
				<Outlet />
			</main>
			<Footer />
		</div>
	)
}
