import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { APP_VERSION_KEYWORD, bumpAppVersion } from '@/lib/version'

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
  console.log("Fetching rules from Supabase...")
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .neq('keyword', APP_VERSION_KEYWORD)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Supabase error fetching rules:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log(`Fetched ${data?.length || 0} rules`)
  return NextResponse.json(data || [])
}

// 添加/更新规则
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, rule } = body

    if (action === 'add') {
      // 确保 project_id 是正确的 UUID
      const { data: projectData } = await supabase
        .from('projects')
        .select('id')
        .eq('code', rule.project_id)
        .single()

      if (projectData) {
        rule.project_id = projectData.id
      }

      const { data, error } = await supabase
        .from('rules')
        .insert(rule)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const versionResult = await bumpRulesVersion()
      return NextResponse.json({ ...data, ...versionResult })
    }

    if (action === 'update') {
      const { data, error } = await supabase
        .from('rules')
        .update(rule)
        .eq('id', rule.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const versionResult = await bumpRulesVersion()
      return NextResponse.json({ ...data, ...versionResult })
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', rule.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      const versionResult = await bumpRulesVersion()
      return NextResponse.json({ success: true, ...versionResult })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
