import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 默认规则（当数据库为空时使用）
const defaultRules: Record<string, any> = {
  haichen: {
    violations: [
      { keyword: '国家级', reason: '绝对化用语', suggestion: '删除或替换' },
      { keyword: '最', reason: '绝对化用语', suggestion: '删除或改为具体描述' },
    ],
    throttling: [
      { keyword: '限时优惠', reason: '限流敏感词', suggestion: '改为"近期活动"' },
    ],
    persona: [],
    suggestions: [
      { keyword: '物价低', reason: '引流风险', suggestion: '避免强调低价' },
      { keyword: '9900万', reason: '数据限制', suggestion: '确保不超过9900万' },
    ]
  },
  shangu: {
    violations: [
      { keyword: '床', reason: '居家信息', suggestion: '删除或改为"办公区"' },
      { keyword: '厨房', reason: '居家信息', suggestion: '改为"餐饮区"' },
    ],
    throttling: [],
    persona: [],
    suggestions: []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { script, project } = await request.json()

    // 从数据库获取规则，注意这里使用连表查询或者手动匹配项目代码
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id')
      .eq('code', project)
      .single()

    const projectId = projectsData?.id

    const { data: rules, error } = await supabase
      .from('rules')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)

    let results: any

    if (error || !rules || rules.length === 0) {
      // 使用默认规则
      const projectRules = defaultRules[project] || defaultRules.haichen
      results = analyzeScript(script, projectRules)
    } else {
      // 按类型分组规则
      const groupedRules = {
        violations: rules.filter((r: any) => r.type === 'violation'),
        throttling: rules.filter((r: any) => r.type === 'throttling'),
        persona: rules.filter((r: any) => r.type === 'persona'),
        suggestions: rules.filter((r: any) => r.type === 'suggestion'),
      }
      results = analyzeScript(script, groupedRules)
    }

    // 保存历史记录
    await supabase.from('history').insert({
      project_id: project,
      script_content: script,
      result: results
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('分析失败:', error)
    return NextResponse.json({ error: '分析失败' }, { status: 500 })
  }
}

function analyzeScript(script: string, rules: any) {
  const lines = script.split('\n')
  const results = {
    violations: [] as any[],
    throttling: [] as any[],
    persona: [] as any[],
    suggestions: [] as any[],
    structure: {} as any
  }

  lines.forEach((line: string, index: number) => {
    const lineNum = index + 1

    // 检查违规
    rules.violations?.forEach((rule: any) => {
      if (line.includes(rule.keyword)) {
        results.violations.push({ line: lineNum, ...rule })
      }
    })

    // 检查限流
    rules.throttling?.forEach((rule: any) => {
      if (line.includes(rule.keyword)) {
        results.throttling.push({ line: lineNum, ...rule })
      }
    })

    // 检查建议
    rules.suggestions?.forEach((rule: any) => {
      if (line.includes(rule.keyword)) {
        results.suggestions.push({ line: lineNum, ...rule })
      }
    })
  })

  // 简化结构分析
  const lastLine = lines.slice(-1)[0] || ''
  results.structure = {
    opening: { detectedPersona: detectPersona(lines.slice(0, Math.ceil(lines.length * 0.2))) },
    body: { matchesPersona: true },
    closing: { hasGuidance: lastLine.includes('直播间') || lastLine.includes('点击') }
  }

  return results
}

function detectPersona(lines: string[]) {
  const text = lines.join('')
  if (text.includes('养老') || text.includes('康养')) return 'elderly'
  if (text.includes('家庭') || text.includes('度假')) return 'middleAged'
  return null
}