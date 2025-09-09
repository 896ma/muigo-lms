import { Outlet, Link } from 'react-router-dom'
import { useState, useMemo } from 'react'

function Navbar({ isDark, onToggle }) {
	const hoverClass = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
	return (
		<nav className={isDark ? 'border-b bg-gray-900' : 'border-b bg-white'}>
			<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
				<Link to="/" className={isDark ? 'text-jungle font-bold' : 'text-jungle font-bold'}>Farmers LMS</Link>
				<div className="flex items-center gap-2">
					<ul className="flex gap-1 text-sm">
						<li><Link to="/" className={`px-2 py-1 rounded ${hoverClass} ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Home</Link></li>
						<li><Link to="/courses" className={`px-2 py-1 rounded ${hoverClass} ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Courses</Link></li>
						<li><Link to="/register" className={`px-2 py-1 rounded ${hoverClass} ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Register</Link></li>
						<li><Link to="/portal" className={`px-2 py-1 rounded ${hoverClass} ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Farmer Portal</Link></li>
						<li><Link to="/admin" className={`px-2 py-1 rounded ${hoverClass} ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Admin</Link></li>
					</ul>
					<button onClick={onToggle} className={`ml-3 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm border ${isDark ? 'border-gray-700 text-gray-100 hover:bg-gray-800' : 'border-gray-200 text-gray-900 hover:bg-gray-100'}`}>
						{isDark ? 'Light' : 'Dark'}
					</button>
				</div>
			</div>
		</nav>
	)
}

export default function AppLayout() {
	const [isDark, setIsDark] = useState(false)
	const containerClass = useMemo(() => isDark 
		? 'min-h-screen text-gray-100 bg-gradient-to-b from-jungle-900 via-jungle-800 to-gray-950'
		: 'min-h-screen text-gray-900 bg-gradient-to-b from-jungle-100 via-white to-white'
	, [isDark])
	return (
		<div className={containerClass}>
			<Navbar isDark={isDark} onToggle={() => setIsDark(v => !v)} />
			<main className="max-w-6xl mx-auto px-4 py-8">
				<Outlet />
			</main>
		</div>
	)
}
