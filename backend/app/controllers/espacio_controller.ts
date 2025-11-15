import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class EspacioController {
  /**
   * Listar todos los espacios activos con sus configuraciones
   */
  async index({ response }: HttpContext) {
    try {
      const espacios = await db
        .from('espacios')
        .where('activo', true)
        .orderBy('id', 'asc')

      return response.json({
        success: true,
        data: espacios,
      })
    } catch (error) {
      console.error('Error al obtener espacios:', error)
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
      const espacio = await db
        .from('espacios')
        .where('id', params.id)
        .where('activo', true)
        .first()

      if (!espacio) {
        return response.status(404).json({
          success: false,
          message: 'Espacio no encontrado',
        })
      }

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
      const espacios = await db
        .from('espacios')
        .select(
          'espacios.id',
          'espacios.nombre',
          db.raw('COALESCE(MAX(configuraciones_espacio.capacidad), 0) as capacidad_maxima')
        )
        .leftJoin('configuraciones_espacio', 'espacios.id', 'configuraciones_espacio.espacio_id')
        .where('espacios.activo', true)
        .groupBy('espacios.id', 'espacios.nombre')
        .orderBy('espacios.id', 'asc')

      const simplificado = espacios.map((espacio: any) => ({
        id: espacio.id,
        nombre: espacio.nombre,
        capacidadMaxima: parseInt(espacio.capacidad_maxima) || 0,
      }))

      return response.json({
        success: true,
        data: simplificado,
      })
    } catch (error) {
      console.error('Error al obtener espacios:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener espacios',
        error: error.message,
      })
    }
  }

  /**
   * Listar todas las disposiciones
   */
  async listarDisposiciones({ response }: HttpContext) {
    try {
      const disposiciones = await db
        .from('disposiciones')
        .orderBy('id', 'asc')

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

  /**
   * Listar prestaciones disponibles (servicios adicionales)
   */
  async listarPrestaciones({ response }: HttpContext) {
    try {
      const prestaciones = [
        { id: 1, nombre: 'Sillas', precio: 50000 },
        { id: 2, nombre: 'Mesas', precio: 80000 },
        { id: 3, nombre: 'Sonido', precio: 100000 },
        { id: 4, nombre: 'Iluminación', precio: 60000 },
        { id: 5, nombre: 'Proyector / Pantalla', precio: 100000 },
        { id: 6, nombre: 'WiFi', precio: 30000 },
        { id: 7, nombre: 'Catering', precio: 150000 },
        { id: 8, nombre: 'Personal de apoyo', precio: 100000 },
        { id: 9, nombre: 'Estacionamiento', precio: 20000 },
      ]

      return response.json({
        success: true,
        data: prestaciones,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al obtener prestaciones',
      })
    }
  }
}
