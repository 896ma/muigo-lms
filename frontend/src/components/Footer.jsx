export default function Footer() {
	return (
		<footer className="mt-12 bg-jungle-800 text-gray-100 border-t border-jungle-600">
			<div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
				<div>
					<h3 className="font-semibold text-lg">Farmers LMS</h3>
					<p className="mt-3 text-sm text-gray-300">Practical courses for modern farming, delivered simply.</p>
				</div>
				<div>
					<h4 className="font-medium">Follow Us</h4>
					<ul className="mt-3 space-y-2 text-sm">
						<li><a className="hover:underline" href="#">LinkedIn</a></li>
						<li><a className="hover:underline" href="#">WhatsApp</a></li>
						<li><a className="hover:underline" href="#">YouTube</a></li>
						<li><a className="hover:underline" href="#">Instagram</a></li>
					</ul>
				</div>
				<div>
					<h4 className="font-medium">Contact</h4>
					<ul className="mt-3 space-y-2 text-sm text-gray-300">
						<li>Nairobi, Kenya</li>
						<li>Westlands</li>
					</ul>
				</div>
				<div>
					<h4 className="font-medium">Quick links</h4>
					<ul className="mt-3 space-y-2 text-sm">
						<li><a className="hover:underline" href="#">Our Story</a></li>
						<li><a className="hover:underline" href="#">Blog</a></li>
						<li><a className="hover:underline" href="#">Terms & Conditions</a></li>
					</ul>
				</div>
			</div>
			<div className="bg-jungle-700">
				<div className="max-w-6xl mx-auto px-4 py-3 text-xs text-gray-300 flex items-center justify-between">
					<span>© {new Date().getFullYear()} Farmers LMS</span>
					<span>Bringing Freshness Home</span>
				</div>
			</div>
		</footer>
	);
}


