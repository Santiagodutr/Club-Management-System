import type { HttpContext } from '@adonisjs/core/http'
import Socio from '#models/socio'
import vine from '@vinejs/vine'

export default class SociosController {
  /**
   * Listar todos los socios
   */
  async index({ response }: HttpContext) {
    try {
      const socios = await Socio.all()
      return response.json({
        success: true,
        data: socios,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al listar socios',
        error: error.message,
      })
    }
  }

  /**
   * Obtener detalle de un socio
   */
  async mostrar({ params, response }: HttpContext) {
    try {
      const socio = await Socio.find(params.id)
      if (!socio) {
        return response.status(404).json({
          success: false,
          message: 'Socio no encontrado',
        })
      }
      return response.json({
        success: true,
        data: socio,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener socio',
        error: error.message,
      })
    }
  }

  /**
   * Crear un nuevo socio
   */
  async crear({ request, response }: HttpContext) {
    try {
      const schema = vine.object({
        codigo: vine.string().trim().minLength(3).maxLength(50),
        activo: vine.boolean().optional(),
      })

      const payload = await vine.validate({ schema, data: request.all() })

      // Verificar que no exista otro socio con el mismo código
      const socioExistente = await Socio.findBy('codigo', payload.codigo)
      if (socioExistente) {
        return response.status(400).json({
          success: false,
          message: `Ya existe un socio con el código ${payload.codigo}`,
        })
      }

      const socio = await Socio.create(payload)
      return response.status(201).json({
        success: true,
        message: 'Socio creado exitosamente',
        data: socio,
      })
    } catch (error) {
      if (error.messages) {
        return response.status(400).json({
          success: false,
          message: 'Validación fallida',
          errors: error.messages,
        })
      }
      return response.status(500).json({
        success: false,
        message: 'Error al crear socio',
        error: error.message,
      })
    }
  }

  /**
   * Actualizar un socio
   */
  async actualizar({ params, request, response }: HttpContext) {
    try {
      const socio = await Socio.find(params.id)
      if (!socio) {
        return response.status(404).json({
          success: false,
          message: 'Socio no encontrado',
        })
      }

      const schema = vine.object({
        codigo: vine.string().trim().minLength(3).maxLength(50).optional(),
        activo: vine.boolean().optional(),
      })

      const payload = await vine.validate({ schema, data: request.all() })

      // Si se intenta cambiar el código, verificar que sea único
      if (payload.codigo && payload.codigo !== socio.codigo) {
        const socioExistente = await Socio.findBy('codigo', payload.codigo)
        if (socioExistente) {
          return response.status(400).json({
            success: false,
            message: `Ya existe un socio con el código ${payload.codigo}`,
          })
        }
      }

      socio.merge(payload)
      await socio.save()

      return response.json({
        success: true,
        message: 'Socio actualizado exitosamente',
        data: socio,
      })
    } catch (error) {
      if (error.messages) {
        return response.status(400).json({
          success: false,
          message: 'Validación fallida',
          errors: error.messages,
        })
      }
      return response.status(500).json({
        success: false,
        message: 'Error al actualizar socio',
        error: error.message,
      })
    }
  }

  /**
   * Eliminar un socio
   */
  async eliminar({ params, response }: HttpContext) {
    try {
      const socio = await Socio.find(params.id)
      if (!socio) {
        return response.status(404).json({
          success: false,
          message: 'Socio no encontrado',
        })
      }

      await socio.delete()
      return response.json({
        success: true,
        message: 'Socio eliminado exitosamente',
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al eliminar socio',
        error: error.message,
      })
    }
  }

  /**
   * Buscar socio por código (público - para cotizaciones)
   */
  async buscarPublico({ request, response }: HttpContext) {
    try {
      const { codigo } = request.only(['codigo']) as {
        codigo?: string
      }

      if (!codigo) {
        return response.status(400).json({
          success: false,
          message: 'codigo es requerido',
        })
      }

      const socio = await Socio.porCodigo(codigo)

      if (!socio) {
        return response.status(404).json({
          success: false,
          message: `Socio con código ${codigo} no encontrado`,
        })
      }

      return response.json({
        success: true,
        data: {
          id: socio.id,
          codigo: socio.codigo,
          activo: socio.activo,
        },
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al buscar socio',
        error: error.message,
      })
    }
  }
}
