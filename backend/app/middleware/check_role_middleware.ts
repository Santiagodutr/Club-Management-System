import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import db from '@adonisjs/lucid/services/db'

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

    // Consultar la BD para obtener el rol del usuario (bypassing RLS)
    try {
      console.log('[CheckRoleMiddleware] Buscando usuario con ID:', user.id)
      
      const usuario = await db
        .from('usuarios')
        .select('rol')
        .where('id', user.id)
        .first()

      console.log('[CheckRoleMiddleware] Resultado query:', usuario)

      if (!usuario) {
        console.error('[CheckRoleMiddleware] Usuario no encontrado en la tabla usuarios')
        return response.forbidden({
          message: 'Usuario no encontrado en BD o sin permiso.',
        })
      }

      // Verificar que el rol coincida
      if (usuario.rol !== requiredRole) {
        console.log(`[CheckRoleMiddleware] Rol no coincide. Requerido: ${requiredRole}, Tiene: ${usuario.rol}`)
        return response.forbidden({
          message: `Se requiere rol: ${requiredRole}. Tienes: ${usuario.rol}`,
        })
      }
      
      console.log('[CheckRoleMiddleware] Rol verificado correctamente:', usuario.rol)
    } catch (err) {
      console.error('[CheckRoleMiddleware] Error:', err)
      return response.internalServerError({
        message: 'Error al verificar rol del usuario.',
      })
    }

    return next()
  }
}
