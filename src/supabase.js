import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://lpzwhrapkwuqnxhlyeln.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'sb_publishable_PlZlJUAHx-pOLMXYvWRR6Q_BZG5XSQh'

export const authRedirectUrl =
  import.meta.env.VITE_AUTH_REDIRECT_URL ?? 'http://localhost:5178'

/** Passed to signUp so confirmation emails return users to the app. */
export const signUpOptions = {
  emailRedirectTo: authRedirectUrl,
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
