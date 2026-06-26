import { NextRequest, NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/adminAuth'
import { getRulesDocument, updateRulesDocument } from '@/lib/rulesStore'

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error && 'message' in error) {
    return String(error.message)
  }
  return '未知错误'
}

function unauthorizedResponse() {
  return NextResponse.json({ error: '请先登录管理后台' }, { status: 401 })
}

function rulesWriteErrorResponse(error: unknown) {
  console.error('规则写入失败:', error)
  return NextResponse.json(
    {
      error: '规则保存失败，请检查 GitHub 写入权限或稍后重试。',
      detail: getErrorMessage(error),
    },
    { status: 503 }
  )
}

// 获取所有规则
export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return unauthorizedResponse()
  }

  try {
    const { document, source, warning } = await getRulesDocument()
    return NextResponse.json({
      rules: document.rules,
      version: document.version,
      source,
      warning,
    })
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 })
  }
}

// 添加/更新规则
export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return unauthorizedResponse()
  }

  try {
    const body = await request.json()
    const { action, rule } = body

    if (!['add', 'update', 'delete'].includes(action)) {
      return NextResponse.json({ error: '未知操作' }, { status: 400 })
    }

    const result = await updateRulesDocument(action, rule)

    if (action === 'delete') {
      return NextResponse.json({ success: true, appVersion: result.appVersion })
    }

    return NextResponse.json({ ...result.rule, appVersion: result.appVersion })
  } catch (error) {
    return rulesWriteErrorResponse(error)
  }
}
