import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取所有规则
export async function GET() {
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

// 添加/更新规则
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, rule } = body

    if (action === 'add') {
      const { data, error } = await supabase
        .from('rules')
        .insert(rule)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    if (action === 'update') {
      const { data, error } = await supabase
        .from('rules')
        .update(rule)
        .eq('id', rule.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', rule.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
