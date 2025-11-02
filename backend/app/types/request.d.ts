import type { User } from '@supabase/supabase-js'
import '@adonisjs/core/http'

declare module '@adonisjs/core/http' {
  interface Request {
    user?: User
  }
}
