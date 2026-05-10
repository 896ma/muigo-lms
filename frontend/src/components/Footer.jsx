export default function Footer() {
	return (
		<footer className="mt-16 border-t border-jungle-700/40 bg-gradient-to-b from-jungle-900 via-jungle-900 to-jungle-800 text-jungle-50">
			<div className="max-w-6xl mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs tracking-wide">
					<div className="space-y-2">
						<p className="text-lg font-semibold tracking-normal flex items-center gap-2">
							<img src="/mfarm-logo.svg" alt="M-Farm logo" className="h-6 w-auto rounded-sm bg-white/90 p-0.5" />
							<span>M-Farm LMS</span>
						</p>
						<p className="text-jungle-100/80">Nairobi, Kenya</p>
						<p className="text-jungle-100/80">Practical farming education for modern growers.</p>
					</div>
					<div className="space-y-2">
						<p className="uppercase text-jungle-200/80">Pages</p>
						<div className="space-y-1">
							<a className="block hover:text-white transition-colors" href="/">Home</a>
							<a className="block hover:text-white transition-colors" href="/courses">Courses</a>
						</div>
					</div>
					<div className="space-y-2 md:text-right">
						<p className="uppercase text-jungle-200/80">Connect</p>
						<div className="space-y-1">
							<a className="block hover:text-white transition-colors" href="#">Instagram</a>
							<a className="block hover:text-white transition-colors" href="#">LinkedIn</a>
							<a className="block hover:text-white transition-colors" href="#">YouTube</a>
						</div>
					</div>
				</div>

				<div className="mt-8 border-t border-jungle-600/30 pt-6 overflow-hidden text-center">
					<p className="text-4xl sm:text-6xl lg:text-7xl font-semibold leading-none tracking-tight text-jungle-200/25">
						M-Farm LMS
					</p>
				</div>

				<div className="mt-8 border-t border-jungle-600/40 pt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-[11px] text-jungle-100/70">
					<span>© {new Date().getFullYear()} M-Farm LMS</span>
					<span>Grow smarter. Farm better.</span>
				</div>
			</div>
		</footer>
	);
}


