import { NextResponse } from 'next/server'
import { getRulesDocument } from '@/lib/rulesStore'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { document } = await getRulesDocument()
    return NextResponse.json({ version: document.version })
  } catch (error) {
    console.error('获取版本号失败:', error)
    return NextResponse.json({ version: 'V1.0' })
  }
}
