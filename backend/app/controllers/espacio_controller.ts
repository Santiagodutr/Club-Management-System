import type { HttpContext } from '@adonisjs/core/http'
import Espacio from '#models/espacio'
import ConfiguracionEspacio from '#models/configuracion_espacio'
import Disposicion from '#models/disposicion'

export default class EspacioController {
  /**
   * Listar todos los espacios activos con sus configuraciones
   */
  async index({ response }: HttpContext) {
    try {
      const espacios = await Espacio.query()
        .where('activo', true)
        .preload('configuraciones', (query) => {
          query.preload('disposicion').preload('tarifas')
        })
        .orderBy('id', 'asc')

      return response.json({
        success: true,
        data: espacios,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener espacios',
        error: error.message,
      })
    }
  }

  /**
   * Obtener un espacio específico por ID
   */
  async show({ params, response }: HttpContext) {
    try {
      const espacio = await Espacio.query()
        .where('id', params.id)
        .where('activo', true)
        .preload('configuraciones', (query) => {
          query.preload('disposicion').preload('tarifas')
        })
        .firstOrFail()

      return response.json({
        success: true,
        data: espacio,
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Espacio no encontrado',
      })
    }
  }

  /**
   * Obtener espacios simplificados para formularios (id, nombre, capacidad max)
   */
  async listarSimplificado({ response }: HttpContext) {
    try {
      const espacios = await Espacio.query()
        .where('activo', true)
        .preload('configuraciones')
        .orderBy('id', 'asc')

      const simplificado = espacios.map((espacio) => {
        const capacidadMaxima = Math.max(
          ...espacio.configuraciones.map((c) => c.capacidad)
        )
        return {
          id: espacio.id,
          nombre: espacio.nombre,
          capacidadMaxima,
        }
      })

      return response.json({
        success: true,
        data: simplificado,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener espacios',
      })
    }
  }

  /**
   * Listar todas las disposiciones
   */
  async listarDisposiciones({ response }: HttpContext) {
    try {
      const disposiciones = await Disposicion.query().orderBy('id', 'asc')

      return response.json({
        success: true,
        data: disposiciones,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener disposiciones',
      })
    }
  }
}
