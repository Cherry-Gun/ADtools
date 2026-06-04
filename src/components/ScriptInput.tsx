import { useState } from 'react'

interface Props {
  onAnalyze: (script: string) => void
  isLoading: boolean
}

export default function ScriptInput({ onAnalyze, isLoading }: Props) {
  const [script, setScript] = useState('')

  const handleSubmit = () => {
    if (!script.trim()) {
      alert('请输入脚本内容')
      return
    }
    onAnalyze(script)
  }

  return (
    <div>
      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="请在此粘贴您的短视频脚本内容..."
        className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 text-gray-700 text-base leading-relaxed"
      />
      <div className="text-center mt-6">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '分析中...' : '开始分析'}
        </button>
      </div>
    </div>
  )
}
