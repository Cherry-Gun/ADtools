'use client'

import { useEffect, useState } from 'react'
import ProjectSelector from '@/components/ProjectSelector'
import ScriptInput from '@/components/ScriptInput'
import ResultCard from '@/components/ResultCard'
import StructureAnalysis from '@/components/StructureAnalysis'

interface AnalysisResult {
  violations: any[]
  throttling: any[]
  persona: any[]
  suggestions: any[]
  structure: any
}

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [appVersion, setAppVersion] = useState('V1.0')

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch('/api/version')
        const data = await response.json()
        if (data.version) {
          setAppVersion(data.version)
        }
      } catch (error) {
        console.error('获取版本号失败:', error)
      }
    }

    fetchVersion()
  }, [])

  const analyzeScript = async (script: string) => {
    if (!selectedProject) {
      alert('请先选择项目')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, project: selectedProject })
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('分析失败:', error)
      alert('分析失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const totalIssues = results 
    ? results.violations.length + results.throttling.length + results.persona.length + results.suggestions.length 
    : 0

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
            短视频脚本审核工具
          </h1>
          <p className="text-white/80 text-lg">
            专业审核 · 精准定位 · 高效优化
          </p>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl shadow-2xl p-8 animate-fade-in">
          {/* Project Selector */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              选择项目
            </h2>
            <ProjectSelector 
              selected={selectedProject} 
              onSelect={setSelectedProject} 
            />
          </div>

          {/* Script Input */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              脚本内容
            </h2>
            <ScriptInput onAnalyze={analyzeScript} isLoading={isLoading} />
          </div>

          {/* Results Section */}
          {results && (
            <div className="border-t-2 border-gray-100 pt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                审核结果
                <span className="ml-3 text-sm font-normal text-gray-500">
                  共发现 {totalIssues} 处问题
                </span>
              </h2>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <ResultCard type="violation" count={results.violations.length} />
                <ResultCard type="throttling" count={results.throttling.length} />
                <ResultCard type="persona" count={results.persona.length} />
                <ResultCard type="suggestion" count={results.suggestions.length} />
              </div>

              {/* Detailed Results */}
              {results.violations.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">🔴 违规必须修改</h3>
                  {results.violations.map((item, i) => (
                    <div key={i} className="p-4 bg-red-50 rounded-lg mb-2">
                      <div className="font-medium text-red-600">第{item.line}行: {item.keyword}</div>
                      <div className="text-gray-600 text-sm">问题：{item.reason}</div>
                      <div className="text-green-600 text-sm">建议：{item.suggestion}</div>
                    </div>
                  ))}
                </div>
              )}

              {results.throttling.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-yellow-600 mb-2">🟡 容易限流</h3>
                  {results.throttling.map((item, i) => (
                    <div key={i} className="p-4 bg-yellow-50 rounded-lg mb-2">
                      <div className="font-medium text-yellow-600">第{item.line}行: {item.keyword}</div>
                      <div className="text-gray-600 text-sm">问题：{item.reason}</div>
                      <div className="text-green-600 text-sm">建议：{item.suggestion}</div>
                    </div>
                  ))}
                </div>
              )}

              {results.persona.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">⚪ 人设/病句问题</h3>
                  {results.persona.map((item, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg mb-2">
                      <div className="font-medium text-gray-600">第{item.line}行: {item.keyword}</div>
                      <div className="text-gray-600 text-sm">问题：{item.reason}</div>
                      <div className="text-green-600 text-sm">建议：{item.suggestion}</div>
                    </div>
                  ))}
                </div>
              )}

              {results.suggestions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-blue-600 mb-2">🔵 内容建议</h3>
                  {results.suggestions.map((item, i) => (
                    <div key={i} className="p-4 bg-blue-50 rounded-lg mb-2">
                      <div className="font-medium text-blue-600">第{item.line}行: {item.keyword}</div>
                      <div className="text-gray-600 text-sm">问题：{item.reason}</div>
                      <div className="text-green-600 text-sm">建议：{item.suggestion}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Structure Analysis */}
              <StructureAnalysis structure={results.structure} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>规则持续更新中 · 使用过程中如有疑问请联系王艺斌</p>
          <p className="mt-3 inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-white/90 font-semibold">
            版本号：{appVersion}
          </p>
        </div>
      </div>
    </main>
  )
}
