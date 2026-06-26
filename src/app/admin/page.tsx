'use client'

import { useState, useEffect } from 'react'
import { RuleManager } from '@/components/RuleManager'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/session')
        const data = await response.json()
        setIsAuthenticated(Boolean(data.authenticated))
      } catch (err) {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || '登录失败，请重试')
        return
      }

      setIsAuthenticated(true)
      setPassword('')
    } catch (err) {
      setError('登录失败，请重试')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    setIsAuthenticated(false)
    setPassword('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8">
          <div className="animate-pulse text-purple-600 font-medium">加载中...</div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">管理后台</h1>
            <p className="text-gray-500">请输入管理员密码</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                placeholder="输入管理员密码"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">规则管理</h1>
              <p className="text-gray-500 text-sm mt-1">管理脚本审核规则</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
            >
              退出登录
            </button>
          </div>
        </div>

        <RuleManager />
      </div>
    </div>
  )
}
