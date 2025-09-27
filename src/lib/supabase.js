import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to handle Supabase errors
export const handleSupabaseError = (error, operation = 'database operation') => {
  console.error(`Supabase ${operation} error:`, {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    fullError: error
  })
  throw new Error(`Failed ${operation}: ${error?.message || 'Unknown error'}`)
}
