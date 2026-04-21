import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

let cachedClient: SupabaseClient | null = null

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please check your .env file.')
    throw new Error('Supabase client is not configured.')
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return cachedClient
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient()
    const value = client[prop as keyof SupabaseClient]

    if (typeof value === 'function') {
      return value.bind(client)
    }

    return value
  }
})
