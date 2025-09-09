export default function ProgressBar({ value = 0 }) {
	const pct = Math.max(0, Math.min(100, value));
	return (
		<div className="w-full bg-gray-100 rounded-full h-2">
			<div className="h-2 rounded-full bg-jungle" style={{ width: `${pct}%` }} />
		</div>
	);
}


