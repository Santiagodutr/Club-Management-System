import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { supabase } from '#services/supabase_service'

/**
 * Middleware para verificar que el usuario autenticado tiene un rol específico.
 *
 * Uso:
 *   router.post('/admin/endpoint', [Controller, 'method'])
 *     .use(middleware.auth())
 *     .use(middleware.checkRole('admin'))
 *
 * NOTA: Se asume que middleware.auth() ya ejecutó antes y puso request.user
 */
export default class CheckRoleMiddleware {
  async handle(
    { request, response }: HttpContext,
    next: NextFn,
    requiredRole: 'admin' | 'particular' | string
  ) {
    // Obtener user desde el contexto (puesto por SupabaseAuthMiddleware)
    const user = (request as any).user

    if (!user || !user.id) {
      return response.unauthorized({
        message: 'Usuario no autenticado. Ejecuta middleware.auth() primero.',
      })
    }

    // Consultar la BD para obtener el rol del usuario
    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', user.id)
        .single()

      if (error || !usuario) {
        return response.forbidden({
          message: 'Usuario no encontrado en BD o sin permiso.',
        })
      }

      // Verificar que el rol coincida
      if (usuario.rol !== requiredRole) {
        return response.forbidden({
          message: `Se requiere rol: ${requiredRole}. Tienes: ${usuario.rol}`,
        })
      }
    } catch (err) {
      console.error('[CheckRoleMiddleware] Error:', err)
      return response.internalServerError({
        message: 'Error al verificar rol del usuario.',
      })
    }

    return next()
  }
}
