import { NextRequest, NextResponse } from 'next/server'
import { createAdminToken, setAdminCookie, verifyAdminPassword } from '@/lib/adminAuth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!verifyAdminPassword(String(password || ''))) {
    return NextResponse.json({ error: '密码错误，请重试' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  setAdminCookie(response, createAdminToken())
  return response
}
