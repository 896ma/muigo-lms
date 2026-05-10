import { useState } from 'react'

export default function Tabs({ tabs }) {
	const [active, setActive] = useState(0)
	return (
		<div>
			<div className="flex gap-1 border-b border-jungle-700/50 px-4 pt-3">
				{tabs.map((t, idx) => (
					<button
						key={t.label}
						onClick={() => setActive(idx)}
						className={`px-4 py-2 text-sm font-medium border-b-2 transition-all rounded-t-md ${
							active === idx
								? 'border-jungle-400 text-jungle-300 bg-jungle-900/40'
								: 'border-transparent text-jungle-500 hover:text-jungle-300 hover:bg-jungle-900/20'
						}`}
					>
						{t.label}
					</button>
				))}
			</div>
			<div className="pt-2">
				{tabs[active]?.content}
			</div>
		</div>
	)
}
