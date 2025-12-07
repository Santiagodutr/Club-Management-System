import type { HttpContext } from '@adonisjs/core/http'
import ServicioAdicional from '#models/servicio_adicional'

export default class ServiciosAdicionalesController {
  /**
   * GET /api/servicios-adicionales
   * Listar todos los servicios adicionales
   * Query params opcionales:
   * - configuracion_espacio_id: filtrar por configuración de espacio
   * - tipo_cliente: filtrar por tipo de cliente (socio/particular)
   * - activo: filtrar por estado (true/false)
   */
  async index({ request, response }: HttpContext) {
    try {
      const query = ServicioAdicional.query()

      // Filtros opcionales
      const configuracionEspacioId = request.input('configuracion_espacio_id')
      const tipoCliente = request.input('tipo_cliente')
      const activo = request.input('activo')

      if (configuracionEspacioId) {
        query.where('configuracion_espacio_id', configuracionEspacioId)
      }

      if (tipoCliente) {
        query.where('tipo_cliente', tipoCliente)
      }

      if (activo !== undefined) {
        query.where('activo', activo === 'true' || activo === true)
      }

      const servicios = await query.orderBy('nombre', 'asc')

      return response.ok({
        success: true,
        data: servicios,
      })
    } catch (error) {
      console.error('Error listando servicios adicionales:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al listar servicios adicionales',
        error: error.message,
      })
    }
  }

  /**
   * GET /api/servicios-adicionales/:id
   * Obtener un servicio adicional por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const servicio = await ServicioAdicional.find(params.id)

      if (!servicio) {
        return response.notFound({
          success: false,
          message: 'Servicio adicional no encontrado',
        })
      }

      return response.ok({
        success: true,
        data: servicio,
      })
    } catch (error) {
      console.error('Error obteniendo servicio adicional:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al obtener servicio adicional',
        error: error.message,
      })
    }
  }

  /**
   * POST /api/servicios-adicionales
   * Crear un nuevo servicio adicional
   */
  async store({ request, response }: HttpContext) {
    try {
      const servicio = await ServicioAdicional.create({
        nombre: request.input('nombre'),
        descripcion: request.input('descripcion'),
        configuracionEspacioId: request.input('configuracion_espacio_id'),
        tipoCliente: request.input('tipo_cliente'),
        precio: request.input('precio'),
        activo: request.input('activo', true),
      })

      return response.created({
        success: true,
        message: 'Servicio adicional creado exitosamente',
        data: servicio,
      })
    } catch (error) {
      console.error('Error creando servicio adicional:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al crear servicio adicional',
        error: error.message,
      })
    }
  }

  /**
   * PUT /api/servicios-adicionales/:id
   * Actualizar un servicio adicional
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const servicio = await ServicioAdicional.find(params.id)

      if (!servicio) {
        return response.notFound({
          success: false,
          message: 'Servicio adicional no encontrado',
        })
      }

      // Actualizar solo los campos proporcionados
      if (request.input('nombre') !== undefined) servicio.nombre = request.input('nombre')
      if (request.input('descripcion') !== undefined)
        servicio.descripcion = request.input('descripcion')
      if (request.input('configuracion_espacio_id') !== undefined)
        servicio.configuracionEspacioId = request.input('configuracion_espacio_id')
      if (request.input('tipo_cliente') !== undefined)
        servicio.tipoCliente = request.input('tipo_cliente')
      if (request.input('precio') !== undefined) servicio.precio = request.input('precio')
      if (request.input('activo') !== undefined) servicio.activo = request.input('activo')

      await servicio.save()

      return response.ok({
        success: true,
        message: 'Servicio adicional actualizado exitosamente',
        data: servicio,
      })
    } catch (error) {
      console.error('Error actualizando servicio adicional:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al actualizar servicio adicional',
        error: error.message,
      })
    }
  }

  /**
   * DELETE /api/servicios-adicionales/:id
   * Eliminar un servicio adicional
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const servicio = await ServicioAdicional.find(params.id)

      if (!servicio) {
        return response.notFound({
          success: false,
          message: 'Servicio adicional no encontrado',
        })
      }

      await servicio.delete()

      return response.ok({
        success: true,
        message: 'Servicio adicional eliminado exitosamente',
      })
    } catch (error) {
      console.error('Error eliminando servicio adicional:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al eliminar servicio adicional',
        error: error.message,
      })
    }
  }

  /**
   * PATCH /api/servicios-adicionales/:id/toggle
   * Alternar estado activo/inactivo del servicio
   */
  async toggle({ params, response }: HttpContext) {
    try {
      const servicio = await ServicioAdicional.find(params.id)

      if (!servicio) {
        return response.notFound({
          success: false,
          message: 'Servicio adicional no encontrado',
        })
      }

      servicio.activo = !servicio.activo
      await servicio.save()

      return response.ok({
        success: true,
        message: `Servicio ${servicio.activo ? 'activado' : 'desactivado'} exitosamente`,
        data: servicio,
      })
    } catch (error) {
      console.error('Error alternando estado de servicio adicional:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al alternar estado del servicio adicional',
        error: error.message,
      })
    }
  }
}
