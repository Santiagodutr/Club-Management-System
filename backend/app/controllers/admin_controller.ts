import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Cotizacion from '#models/cotizacion'
import Espacio from '#models/espacio'

/**
 * Controlador para endpoints administrativos.
 * Estos endpoints requieren rol 'admin' verificado por middleware.
 */
export default class AdminController {
  /**
   * GET /admin/stats
   * Retorna estadísticas del sistema usando vista materializada (ultra rápido).
   */
  public async stats({ request, response }: HttpContext) {
    try {
      const mes = request.input('mes') // Formato: YYYY-MM
      const espacioId = request.input('espacio_id')
      
      // Query usando la vista materializada (pre-calculada, ultra rápida)
      let query = db.from('cotizaciones_summary').select('*')
      
      if (mes) {
        query = query.whereRaw(`DATE_TRUNC('month', mes) = ?`, [`${mes}-01`])
      }
      
      if (espacioId) {
        query = query.where('espacio_id', espacioId)
      }
      
      const summaryData = await query.orderBy('mes', 'desc').limit(12)
      
      // Estadísticas generales (también optimizadas con índices)
      const [totalCotizaciones, totalEspacios, cotizacionesPendientes] = await Promise.all([
        Cotizacion.query().count('* as total').first(),
        Espacio.query().where('activo', true).count('* as total').first(),
        Cotizacion.query().where('estado', 'pendiente').count('* as total').first()
      ])

      return response.ok({
        success: true,
        data: {
          resumen: summaryData,
          totales: {
            cotizaciones: Number(totalCotizaciones?.$extras.total || 0),
            espacios: Number(totalEspacios?.$extras.total || 0),
            pendientes: Number(cotizacionesPendientes?.$extras.total || 0)
          },
          timestamp: new Date().toISOString(),
        }
      })
    } catch (error) {
      console.error('Error obteniendo stats:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al obtener estadísticas'
      })
    }
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

  /**
   * POST /admin/refresh-stats
   * Refresca la vista materializada de estadísticas.
   * Llamar después de crear/actualizar cotizaciones importantes.
   */
  public async refreshStats({ response }: HttpContext) {
    try {
      await db.rawQuery('SELECT refresh_cotizaciones_summary()')
      
      return response.ok({
        success: true,
        message: 'Estadísticas actualizadas correctamente',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error refrescando stats:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al actualizar estadísticas'
      })
    }
  }

  /**
   * GET /admin/reportes/resumen
   * Obtiene resumen rápido usando vista materializada.
   * Ultra rápido para dashboards.
   */
  public async reporteResumen({ request, response }: HttpContext) {
    try {
      const meses = parseInt(request.input('meses', '6'))
      
      // Query ultra rápida usando vista materializada
      const resumen = await db
        .from('cotizaciones_summary')
        .select(
          'mes',
          db.raw('SUM(total_cotizaciones) as total'),
          db.raw('SUM(ingresos_totales) as ingresos'),
          db.raw('AVG(ticket_promedio) as ticket_promedio'),
          db.raw('SUM(aceptadas) as aceptadas'),
          db.raw('SUM(rechazadas) as rechazadas')
        )
        .groupBy('mes')
        .orderBy('mes', 'desc')
        .limit(meses)
      
      return response.ok({
        success: true,
        data: resumen
      })
    } catch (error) {
      console.error('Error en reporte resumen:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al generar reporte'
      })
    }
  }
}
