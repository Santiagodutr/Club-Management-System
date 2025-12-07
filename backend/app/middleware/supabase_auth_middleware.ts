import { HttpContext } from '@adonisjs/core/http'
import { createClient } from '@supabase/supabase-js'
import Env from '#start/env'

const supabase = createClient(
  Env.get('SUPABASE_URL'),
  Env.get('SUPABASE_SECRET_KEY')
)

export default class SupabaseAuthMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    const { request, response } = ctx
    const authHeader = request.header('Authorization')

    if (!authHeader) {
      return response.unauthorized({ message: 'Missing Authorization header' })
    }

    // Extraer token y limpiar espacios extra
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()

    // Validar formato JWT básico (debe tener 3 partes separadas por puntos)
    if (!token || token.split('.').length !== 3) {
      console.error('[SupabaseAuth] Invalid token format:', {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
        parts: token.split('.').length
      })
      return response.unauthorized({ message: 'Invalid token format' })
    }

    try {
      // Verificar el JWT usando supabase-js
      const { data, error } = await supabase.auth.getUser(token)

      if (error || !data.user) {
        console.error('[SupabaseAuth] Token verification failed:', error?.message)
        return response.unauthorized({ message: 'Invalid or expired token' })
      }

      console.log('[SupabaseAuth] Verified user:', {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role
      })

      ctx.request.user = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      } as any

      await next()
    } catch (error) {
      console.error('[SupabaseAuth] Unexpected error:', error)
      return response.unauthorized({ message: 'Authentication failed' })
    }
  }
}
