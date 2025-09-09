import { useState } from 'react'

export default function Tabs({ tabs }) {
	const [active, setActive] = useState(0)
	return (
		<div>
			<div className="flex gap-2 border-b">
				{tabs.map((t, idx) => (
					<button key={t.label} onClick={() => setActive(idx)} className={`px-3 py-2 text-sm border-b-2 ${active===idx ? 'border-jungle text-jungle' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
						{t.label}
					</button>
				))}
			</div>
			<div className="pt-4">
				{tabs[active]?.content}
			</div>
		</div>
	)
}


