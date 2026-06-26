import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchWithRetry: typeof fetch = async (input, init) => {
  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    try {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      })
    } catch (error) {
      lastError = error
      await sleep(250 * (attempt + 1))
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetchWithRetry,
  },
})
