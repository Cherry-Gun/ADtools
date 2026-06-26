import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { fallbackRules } from '@/lib/fallbackRules'
import { APP_VERSION_KEYWORD, bumpAppVersion } from '@/lib/version'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error && 'message' in error) {
    return String(error.message)
  }
  return '未知错误'
}

function databaseUnavailableResponse(error: unknown) {
  console.error('规则数据库连接失败:', error)
  return NextResponse.json(
    {
      error: '数据库连接失败，暂时无法保存规则。请稍后重试，或检查 Supabase 项目状态。',
      databaseUnavailable: true,
      detail: getErrorMessage(error),
    },
    { status: 503 }
  )
}

function withTimeout<T>(promise: PromiseLike<T>, ms = 5000) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('Supabase request timed out')), ms)
    }),
  ])
}

async function bumpRulesVersion() {
  try {
    return { appVersion: await bumpAppVersion() }
  } catch (error) {
    console.error('更新版本号失败:', error)
    return { versionWarning: '规则已保存，但版本号更新失败' }
  }
}

// 获取所有规则
export async function GET() {
  try {
    console.log("Fetching rules from Supabase...")
    const { data, error } = await withTimeout(
      supabase
        .from('rules')
        .select('*')
        .neq('keyword', APP_VERSION_KEYWORD)
        .order('created_at', { ascending: false })
    )

    if (error) {
      console.error("Supabase error fetching rules:", error)
      return NextResponse.json({
        rules: fallbackRules,
        source: 'fallback',
        warning: '数据库连接失败，当前显示内置备用规则；规则修改功能暂不可用。',
        detail: error.message,
      })
    }

    console.log(`Fetched ${data?.length || 0} rules`)
    return NextResponse.json({
      rules: data || [],
      source: 'supabase',
    })
  } catch (error) {
    console.error("Unexpected rules fetch error:", error)
    return NextResponse.json({
      rules: fallbackRules,
      source: 'fallback',
      warning: '数据库连接失败，当前显示内置备用规则；规则修改功能暂不可用。',
      detail: getErrorMessage(error),
    })
  }
}

// 添加/更新规则
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, rule } = body

    if (action === 'add') {
      // 确保 project_id 是正确的 UUID
      const { data: projectData, error: projectError } = await withTimeout(
        supabase
          .from('projects')
          .select('id')
          .eq('code', rule.project_id)
          .single()
      )

      if (projectError) return databaseUnavailableResponse(projectError)

      if (projectData) {
        rule.project_id = projectData.id
      }

      const { data, error } = await withTimeout(
        supabase
          .from('rules')
          .insert(rule)
          .select()
          .single()
      )

      if (error) return databaseUnavailableResponse(error)
      const versionResult = await bumpRulesVersion()
      return NextResponse.json({ ...data, ...versionResult })
    }

    if (action === 'update') {
      const { data, error } = await withTimeout(
        supabase
          .from('rules')
          .update(rule)
          .eq('id', rule.id)
          .select()
          .single()
      )

      if (error) return databaseUnavailableResponse(error)
      const versionResult = await bumpRulesVersion()
      return NextResponse.json({ ...data, ...versionResult })
    }

    if (action === 'delete') {
      const { error } = await withTimeout(
        supabase
          .from('rules')
          .delete()
          .eq('id', rule.id)
      )

      if (error) return databaseUnavailableResponse(error)
      const versionResult = await bumpRulesVersion()
      return NextResponse.json({ success: true, ...versionResult })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (error) {
    return databaseUnavailableResponse(error)
  }
}
