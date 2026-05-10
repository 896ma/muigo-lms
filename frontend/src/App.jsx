import { Outlet, Link } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import { useState, useMemo } from 'react'

function Navbar() {
	const hoverClass = 'hover:bg-jungle-700/80 hover:shadow-lg hover:shadow-jungle-900/30'
	const navItems = [
		{ to: '/', label: 'Home' },
		{ to: '/courses', label: 'Courses' },
		{ to: '/login', label: 'Login' },
		{ to: '/register', label: 'Register' },
	]
	return (
		<nav className="sticky top-0 z-30 border-b bg-jungle-900/90 backdrop-blur border-jungle-700">
			<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
				<Link to="/" className="text-white font-bold text-lg tracking-wide flex items-center gap-2">
					<img src="/mfarm-logo.svg" alt="M-Farm logo" className="h-8 w-auto rounded-sm bg-white/90 p-1" />
					<span>M-Farm LMS</span>
				</Link>
				<div className="flex items-center gap-2">
					<ul className="flex gap-1 text-sm">
						{navItems.map((item) => (
							<li key={item.to}>
								<Link to={item.to} className={`px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 inline-block ${hoverClass} text-gray-100 hover:text-white`}>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
				</div>
			</div>
		</nav>
	)
} 

export default function AppLayout() {
	const [isDark] = useState(false)
	const containerClass = useMemo(() => isDark 
		? 'min-h-screen flex flex-col text-gray-100 bg-gradient-to-b from-jungle-900 via-jungle-800 to-gray-950'
		: 'min-h-screen flex flex-col text-gray-100 bg-gradient-to-b from-jungle-900 via-jungle-800 to-gray-950'
	, [isDark])
	return (
		<div className={containerClass}>
			<Navbar />
			<main className="flex-1 w-full">
				<div className="max-w-6xl mx-auto px-4 py-8">
					<Outlet />
				</div>
			</main>
			<Footer />
		</div>
	)
}
