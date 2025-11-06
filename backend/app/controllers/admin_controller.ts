import type { HttpContext } from '@adonisjs/core/http'

/**
 * Controlador para endpoints administrativos.
 * Estos endpoints requieren rol 'admin' verificado por middleware.
 */
export default class AdminController {
  /**
   * GET /admin/stats
   * Retorna estadísticas del sistema (solo admin).
   */
  public async stats({ response }: HttpContext) {
    // Ejemplo simple; en la realidad consultarías BD para datos reales
    const stats = {
      total_usuarios: 42,
      total_espacios: 6,
      total_tarifas: 44,
      activo: true,
      timestamp: new Date().toISOString(),
    }

    return response.ok(stats)
  }

  /**
   * POST /admin/config/update
   * Actualiza configuración del sistema (solo admin).
   */
  public async updateConfig({ request, response }: HttpContext) {
    const { key, value } = request.only(['key', 'value']) as {
      key?: string
      value?: any
    }

    if (!key || value === undefined) {
      return response.badRequest({
        message: 'Se requieren key y value',
      })
    }

    // Aquí guardarías en BD, por ejemplo en tabla datos_empresa
    console.log(`[AdminController] Actualizando config: ${key} = ${value}`)

    return response.ok({
      message: `Configuración actualizada: ${key}`,
      key,
      value,
    })
  }

  /**
   * GET /admin/usuarios
   * Lista todos los usuarios (solo admin).
   */
  public async listUsuarios({ response }: HttpContext) {
    // Ejemplo mock
    const usuarios = [
      {
        id: 'uuid-1',
        email: 'admin@example.com',
        rol: 'admin',
        nombre_completo: 'Admin User',
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'uuid-2',
        email: 'user@example.com',
        rol: 'particular',
        nombre_completo: 'Usuario Normal',
        created_at: '2025-01-02T00:00:00Z',
      },
    ]

    return response.ok({
      total: usuarios.length,
      usuarios,
    })
  }
}
