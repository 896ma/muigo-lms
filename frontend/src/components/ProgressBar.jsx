export default function ProgressBar({ value = 0 }) {
	const pct = Math.max(0, Math.min(100, value));
	return (
		<div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
			<div
				className="h-2.5 rounded-full bg-gradient-to-r from-jungle-500 to-jungle-600"
				style={{ width: `${pct}%`, transition: 'width 0.6s ease-out' }}
			/>
		</div>
	);
}


