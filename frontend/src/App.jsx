import { Outlet, Link } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import { useState, useMemo } from 'react'

function Navbar({ isDark, onToggle }) {
	const hoverClass = 'hover:bg-gray-800'
	return (
		<nav className={'border-b bg-gray-900'}>
			<div className="max-w-6xl mx-auto px-6 py-3 flex items-center w-full">
				<Link to="/" className={'text-jungle font-bold mr-auto'}>Farmers LMS</Link>
				<div className="flex items-center gap-2 ml-auto pr-2">
					<ul className="flex gap-1 text-sm">
						<li><Link to="/" className={`px-2 py-1 rounded ${hoverClass} text-gray-100`}>Home</Link></li>
						<li><Link to="/courses" className={`px-2 py-1 rounded ${hoverClass} text-gray-100`}>Courses</Link></li>
						<li><Link to="/register" className={`px-2 py-1 rounded ${hoverClass} text-gray-100`}>Register</Link></li>
						<li><Link to="/portal" className={`px-2 py-1 rounded ${hoverClass} text-gray-100`}>Farmer Portal</Link></li>
						<li><Link to="/admin" className={`px-2 py-1 rounded ${hoverClass} text-gray-100`}>Admin</Link></li>
					</ul>
				</div>
			</div>
		</nav>
	)
}

export default function AppLayout() {
	const [isDark, setIsDark] = useState(false)
	const containerClass = useMemo(() => 'min-h-screen text-gray-100 bg-gradient-to-b from-jungle-900 via-jungle-800 to-gray-950', [isDark])
	return (
		<div className={containerClass}>
			<Navbar isDark={isDark} onToggle={() => setIsDark(v => !v)} />
			<main className="max-w-6xl mx-auto px-4 py-8">
				<Outlet />
			</main>
			<Footer />
		</div>
	)
}
