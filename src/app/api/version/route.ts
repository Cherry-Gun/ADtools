import { NextResponse } from 'next/server'
import { getAppVersion } from '@/lib/version'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const version = await getAppVersion()
    return NextResponse.json({ version })
  } catch (error) {
    console.error('获取版本号失败:', error)
    return NextResponse.json({ version: 'V1.0' })
  }
}
