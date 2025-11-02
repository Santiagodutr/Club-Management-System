import { createClient } from '@supabase/supabase-js'
import env from '#start/env'

const supabaseUrl = env.get('SUPABASE_URL')
const supabaseServiceRoleKey = env.get('SUPABASE_SECRET_KEY')

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL and/or SUPABASE_SECRET_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
