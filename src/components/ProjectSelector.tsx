interface Props {
  selected: string | null
  onSelect: (project: string) => void
}

const projects = [
  { id: 'haichen', name: '北戴河海宸府', emoji: '🏠', desc: '高端海景住宅' },
  { id: 'shangu', name: '北京山谷', emoji: '⛰️', desc: '山景别墅社区' },
]

export default function ProjectSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {projects.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          className={`
            p-5 rounded-2xl border-2 transition-all
            ${selected === p.id 
              ? 'border-indigo-500 ring-4 ring-indigo-200 bg-white' 
              : 'border-gray-200 hover:border-indigo-400 bg-gradient-to-br from-white to-gray-50'}
          `}
        >
          <div className="text-2xl mb-2">{p.emoji}</div>
          <div className="font-semibold text-gray-800">{p.name}</div>
          <div className="text-sm text-gray-500 mt-1">{p.desc}</div>
        </button>
      ))}
    </div>
  )
}
