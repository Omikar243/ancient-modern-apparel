import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

let cachedClient: SupabaseClient | null = null

function getSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    if (!supabaseServiceKey) {
      console.warn('Missing SUPABASE_SERVICE_ROLE_KEY. Please check your .env file.')
    }
    if (!supabaseUrl) {
      console.warn('Missing NEXT_PUBLIC_SUPABASE_URL. Please check your .env file.')
    }

    throw new Error('Supabase admin client is not configured.')
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  return cachedClient
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseAdminClient()
    const value = client[prop as keyof SupabaseClient]

    if (typeof value === 'function') {
      return value.bind(client)
    }

    return value
  }
})
