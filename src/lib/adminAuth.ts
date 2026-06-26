import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export const ADMIN_COOKIE = 'adtools_admin_auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || ADMIN_PASSWORD
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

function sign(payload: string) {
  return crypto
    .createHmac('sha256', ADMIN_AUTH_SECRET)
    .update(payload)
    .digest('base64url')
}

function timingSafeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  if (aBuffer.length !== bBuffer.length) return false
  return crypto.timingSafeEqual(aBuffer, bBuffer)
}

export function verifyAdminPassword(password: string) {
  return timingSafeEqual(password, ADMIN_PASSWORD)
}

export function createAdminToken() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
    })
  ).toString('base64url')

  return `${payload}.${sign(payload)}`
}

export function isAdminTokenValid(token?: string) {
  if (!token) return false

  const [payload, signature] = token.split('.')
  if (!payload || !signature || !timingSafeEqual(signature, sign(payload))) {
    return false
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return Number(data.exp) > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function isAdminRequest(request: NextRequest) {
  return isAdminTokenValid(request.cookies.get(ADMIN_COOKIE)?.value)
}

export function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}
