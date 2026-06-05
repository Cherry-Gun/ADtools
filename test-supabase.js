import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase URL and Anon Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabase() {
  console.log('Testing Supabase Connection...')
  
  const { data, error } = await supabase
    .from('rules')
    .select('*')
  
  if (error) {
    console.error('❌ Error fetching rules:', error)
  } else {
    console.log(`✅ Successfully fetched ${data.length} rules!`)
    if (data.length > 0) {
      console.log('Sample rule:', data[0])
    } else {
      console.log('⚠️ The rules array is empty. This could be due to RLS policies!')
    }
  }
}

testSupabase()
