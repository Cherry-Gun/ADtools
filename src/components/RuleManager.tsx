'use client'

import { useState, useEffect } from 'react'

type RuleType = 'violation' | 'throttling' | 'persona' | 'suggestion'

interface Rule {
  id?: number
  type: RuleType
  keyword: string
  reason: string
  suggestion: string
  project_id: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

interface RuleFormData {
  type: RuleType
  keyword: string
  reason: string
  suggestion: string
  project_id: string
  is_active: boolean
}

const PROJECTS = [
  { id: 'haichen', name: '北戴河海宸府' },
  { id: 'shangu', name: '北京山谷' },
]

const RULE_TYPES: { value: RuleType; label: string }[] = [
  { value: 'violation', label: '违规' },
  { value: 'throttling', label: '限流' },
  { value: 'persona', label: '人设' },
  { value: 'suggestion', label: '建议' },
]

const EMPTY_FORM: RuleFormData = {
  type: 'violation',
  keyword: '',
  reason: '',
  suggestion: '',
  project_id: 'haichen',
  is_active: true,
}

export function RuleManager() {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [formData, setFormData] = useState<RuleFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterProject, setFilterProject] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const res = await fetch('/api/rules')
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setRules(data || [])
      }
    } catch (err) {
      setError('获取规则失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const action = editingRule ? 'update' : 'add'
      const payload = { action, rule: editingRule ? { ...editingRule, ...formData } : formData }

      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        await fetchRules()
        setShowForm(false)
        setEditingRule(null)
        setFormData(EMPTY_FORM)
      }
    } catch (err) {
      setError('保存规则失败')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule)
    setFormData({
      type: rule.type,
      keyword: rule.keyword,
      reason: rule.reason,
      suggestion: rule.suggestion,
      project_id: rule.project_id,
      is_active: rule.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条规则吗？')) return

    setDeletingId(id)
    setError('')

    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', rule: { id } }),
      })

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        await fetchRules()
      }
    } catch (err) {
      setError('删除规则失败')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (rule: Rule) => {
    try {
      const res = await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          rule: { ...rule, is_active: !rule.is_active },
        }),
      })

      const data = await res.json()
      if (!data.error) {
        await fetchRules()
      }
    } catch (err) {
      setError('切换状态失败')
    }
  }

  const openAddForm = () => {
    setEditingRule(null)
    setFormData(EMPTY_FORM)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingRule(null)
    setFormData(EMPTY_FORM)
    setError('')
  }

  const filteredRules = rules.filter((rule) => {
    if (filterProject !== 'all' && rule.project_id !== filterProject) return false
    if (filterType !== 'all' && rule.type !== filterType) return false
    return true
  })

  const getTypeLabel = (type: RuleType) => {
    return RULE_TYPES.find((t) => t.value === type)?.label || type
  }

  const getTypeColor = (type: RuleType) => {
    const colors: Record<RuleType, string> = {
      violation: 'bg-red-100 text-red-700',
      throttling: 'bg-orange-100 text-orange-700',
      persona: 'bg-blue-100 text-blue-700',
      suggestion: 'bg-green-100 text-green-700',
    }
    return colors[type]
  }

  const getProjectName = (projectId: string) => {
    return PROJECTS.find((p) => p.id === projectId)?.name || projectId
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="animate-pulse text-purple-600 font-medium">加载规则中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="glass rounded-xl p-4 bg-red-50 border border-red-200">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="glass rounded-2xl p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-purple-500 outline-none"
            >
              <option value="all">全部项目</option>
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-purple-500 outline-none"
            >
              <option value="all">全部类型</option>
              {RULE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={openAddForm}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            添加规则
          </button>
        </div>

        {filteredRules.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>暂无规则</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">项目</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">关键词</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">原因/内容</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">建议</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{getProjectName(rule.project_id)}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(rule.type)}`}>
                        {getTypeLabel(rule.type)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-mono">{rule.keyword}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{rule.reason}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{rule.suggestion}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          rule.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {rule.is_active ? '启用' : '禁用'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="编辑"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => rule.id && handleDelete(rule.id)}
                          disabled={deletingId === rule.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="删除"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingRule ? '编辑规则' : '添加规则'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">项目</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    required
                  >
                    {PROJECTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as RuleType })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    required
                  >
                    {RULE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">关键词</label>
                <input
                  type="text"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                  placeholder="输入关键词"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">原因/内容</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                  rows={3}
                  placeholder="输入原因或内容"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">建议</label>
                <textarea
                  value={formData.suggestion}
                  onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                  rows={3}
                  placeholder="输入建议"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  启用规则
                </label>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                >
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}