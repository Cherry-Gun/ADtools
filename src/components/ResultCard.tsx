interface Props {
  type: 'violation' | 'throttling' | 'persona' | 'suggestion'
  count: number
}

const config = {
  violation: { label: '违规必须修改', color: 'red', bg: 'from-red-50 to-orange-50' },
  throttling: { label: '容易限流', color: 'yellow', bg: 'from-yellow-50 to-amber-50' },
  persona: { label: '人设/病句问题', color: 'gray', bg: 'from-gray-50 to-slate-50' },
  suggestion: { label: '内容建议', color: 'blue', bg: 'from-blue-50 to-indigo-50' },
}

export default function ResultCard({ type, count }: Props) {
  const c = config[type]
  return (
    <div className={`p-4 rounded-xl border bg-gradient-to-br ${c.bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-2xl font-bold text-${c.color}-600`}>{count}</div>
          <div className="text-sm text-gray-600">{c.label}</div>
        </div>
        <div className="text-3xl">
          {type === 'violation' ? '🔴' : type === 'throttling' ? '🟡' : type === 'persona' ? '⚪' : '🔵'}
        </div>
      </div>
    </div>
  )
}
