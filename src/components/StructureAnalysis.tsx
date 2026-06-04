interface Props {
  structure: any
}

export default function StructureAnalysis({ structure }: Props) {
  if (!structure) return null

  const personaNames: Record<string, string> = {
    elderly: '老年人（康养/养老）',
    middleAged: '中年人（家庭/度假）',
    vacation: '度假（休闲/旅游）',
  }

  return (
    <div className="mt-6 p-5 bg-purple-50 rounded-2xl border-2 border-purple-200">
      <h3 className="text-lg font-bold text-purple-600 mb-4">📋 三段式脚本结构分析</h3>

      {/* 开头分析 */}
      <div className="p-4 bg-white rounded-lg mb-3">
        <div className="font-semibold text-purple-700 mb-2">【开头】分析</div>
        {structure.opening?.detectedPersona && (
          <div className="text-blue-600 text-sm mb-2">
            🎯 识别人设：<strong>{personaNames[structure.opening.detectedPersona]}</strong>
          </div>
        )}
        {structure.opening?.hasHook ? (
          <div className="text-green-600 text-sm">✓ 有钩子</div>
        ) : (
          <div className="text-orange-500 text-sm">⚠️ 缺少钩子</div>
        )}
      </div>

      {/* 中间分析 */}
      <div className="p-4 bg-white rounded-lg mb-3">
        <div className="font-semibold text-purple-700 mb-2">【中间】分析</div>
        {structure.body?.matchesPersona === true && (
          <div className="text-green-600 text-sm">✓ 内容与人设匹配</div>
        )}
        {structure.body?.matchesPersona === false && (
          <div className="text-red-500 text-sm">⚠️ {structure.body.mismatchReason}</div>
        )}
      </div>

      {/* 结尾分析 */}
      <div className="p-4 bg-white rounded-lg">
        <div className="font-semibold text-purple-700 mb-2">【结尾】分析</div>
        {structure.closing?.hasGuidance ? (
          <div className="text-green-600 text-sm">✓ 有行动引导</div>
        ) : (
          <div className="text-orange-500 text-sm">⚠️ 缺少引导</div>
        )}
      </div>
    </div>
  )
}
