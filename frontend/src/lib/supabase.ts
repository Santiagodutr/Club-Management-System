import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.SUPABASE_URL || 'https://bnoftsxwpxzmwjrmxoxc.supabase.co'
const supabaseKey = import.meta.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_YLeoJK1Kxf_Xm0nAHlmO8Q_2cHXCub1'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})
