import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import ServicioAdicional from '#models/servicio_adicional'

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
        .first()

      if (!espacio) {
        return response.status(404).json({
          success: false,
          message: 'Espacio no encontrado',
        })
      }

      return response.json(espacio)
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Espacio no encontrado',
      })
    }
  }

  /**
   * Crear un nuevo espacio
   */
  async store({ request, response }: HttpContext) {
    try {
      const datos = request.only([
        'nombre',
        'slug',
        'subtitulo',
        'descripcion_completa',
        'capacidad_minima',
        'capacidad_maxima',
        'area_m2',
        'horario_disponible',
        'precio_desde',
        'caracteristicas',
        'servicios_incluidos',
        'imagenes',
        'destacado',
        'activo',
      ])

      // Validar campo requerido
      if (!datos.nombre) {
        return response.status(400).json({
          success: false,
          message: 'El nombre es obligatorio',
        })
      }

      // Generar slug si no viene
      if (!datos.slug) {
        datos.slug = datos.nombre
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      }

      // Convertir arrays a JSON para campos JSONB
      if (datos.caracteristicas && Array.isArray(datos.caracteristicas)) {
        datos.caracteristicas = JSON.stringify(datos.caracteristicas)
      }
      if (datos.servicios_incluidos && Array.isArray(datos.servicios_incluidos)) {
        datos.servicios_incluidos = JSON.stringify(datos.servicios_incluidos)
      }
      if (datos.imagenes && Array.isArray(datos.imagenes)) {
        datos.imagenes = JSON.stringify(datos.imagenes)
      }

      // Insertar el espacio
      const [espacio] = await db
        .table('espacios')
        .insert({
          ...datos,
          contenido_actualizado_at: new Date(),
        })
        .returning('*')

      return response.json({
        success: true,
        data: espacio,
      })
    } catch (error) {
      console.error('Error al crear espacio:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al crear espacio',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Eliminar un espacio
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const espacioId = parseInt(params.id)

      // Validar que el espacio existe
      const espacioExistente = await db.from('espacios').where('id', espacioId).first()

      if (!espacioExistente) {
        return response.status(404).json({
          success: false,
          message: 'Espacio no encontrado',
        })
      }

      // Eliminar el espacio (esto eliminará en cascada las configuraciones relacionadas)
      await db.from('espacios').where('id', espacioId).delete()

      return response.json({
        success: true,
        message: 'Espacio eliminado exitosamente',
      })
    } catch (error) {
      console.error('Error al eliminar espacio:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al eliminar espacio',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Actualizar un espacio completo
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const espacioId = parseInt(params.id)
      const datos = request.only([
        'nombre',
        'slug',
        'subtitulo',
        'descripcion_completa',
        'capacidad_minima',
        'capacidad_maxima',
        'area_m2',
        'horario_disponible',
        'precio_desde',
        'caracteristicas',
        'servicios_incluidos',
        'imagenes',
        'destacado',
        'activo',
      ])

      // Validar que el espacio existe
      const espacioExistente = await db.from('espacios').where('id', espacioId).first()

      if (!espacioExistente) {
        return response.status(404).json({
          success: false,
          message: 'Espacio no encontrado',
        })
      }

      // Convertir arrays a JSON para campos JSONB
      if (datos.caracteristicas && Array.isArray(datos.caracteristicas)) {
        datos.caracteristicas = JSON.stringify(datos.caracteristicas)
      }
      if (datos.servicios_incluidos && Array.isArray(datos.servicios_incluidos)) {
        datos.servicios_incluidos = JSON.stringify(datos.servicios_incluidos)
      }
      if (datos.imagenes && Array.isArray(datos.imagenes)) {
        datos.imagenes = JSON.stringify(datos.imagenes)
      }

      // Actualizar timestamp de contenido
      ;(datos as any).contenido_actualizado_at = new Date()

      // Actualizar el espacio
      await db.from('espacios').where('id', espacioId).update(datos)

      // Obtener el espacio actualizado
      const espacioActualizado = await db.from('espacios').where('id', espacioId).first()

      return response.json({
        success: true,
        data: espacioActualizado,
      })
    } catch (error) {
      console.error('Error al actualizar espacio:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al actualizar espacio',
        error: error instanceof Error ? error.message : 'Unknown error',
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
   * Obtener configuraciones del espacio (disposiciones disponibles para un espacio específico)
   */
  async obtenerConfiguracionesEspacio({ params, response }: HttpContext) {
    try {
      const espacioId = parseInt(params.espacioId)

      const configuraciones = await db
        .from('configuraciones_espacio')
        .select(
          'configuraciones_espacio.id',
          'configuraciones_espacio.capacidad',
          'disposiciones.id as disposicion_id',
          'disposiciones.nombre as disposicion_nombre',
          'disposiciones.descripcion as disposicion_descripcion',
          'disposiciones.imagen_url as disposicion_imagen_url'
        )
        .innerJoin('disposiciones', 'configuraciones_espacio.disposicion_id', 'disposiciones.id')
        .where('configuraciones_espacio.espacio_id', espacioId)
        .orderBy('configuraciones_espacio.id', 'asc')

      // Cargar tarifas para cada configuración
      const configuracionesConTarifas = await Promise.all(
        configuraciones.map(async (config: any) => {
          // Tarifas base (4h y 8h)
          const tarifasBase = await db
            .from('tarifas')
            .select('tipo_cliente', 'precio_4_horas', 'precio_8_horas')
            .where('configuracion_espacio_id', config.id)

          // Tarifas adicionales
          const tarifasAdicionales = await db
            .from('tarifas_hora_adicional')
            .select('tipo_cliente', 'base_horas', 'precio')
            .where('configuracion_espacio_id', config.id)

          // Organizar tarifas en un objeto
          const tarifas: any = {}
          
          tarifasBase.forEach((tarifa: any) => {
            const prefix = tarifa.tipo_cliente === 'socio' ? 'socio' : 'particular'
            tarifas[`${prefix}_4h`] = tarifa.precio_4_horas ? parseFloat(tarifa.precio_4_horas) : null
            tarifas[`${prefix}_8h`] = tarifa.precio_8_horas ? parseFloat(tarifa.precio_8_horas) : null
          })

          tarifasAdicionales.forEach((tarifa: any) => {
            const prefix = tarifa.tipo_cliente === 'socio' ? 'socio' : 'particular'
            const suffix = tarifa.base_horas === 4 ? '4h' : '8h'
            tarifas[`${prefix}_adicional_${suffix}`] = tarifa.precio ? parseFloat(tarifa.precio) : null
          })

          return {
            id: config.id,
            capacidad: config.capacidad,
            disposicion: {
              id: config.disposicion_id,
              nombre: config.disposicion_nombre,
              descripcion: config.disposicion_descripcion,
              imagen_url: config.disposicion_imagen_url,
            },
            tarifas: Object.keys(tarifas).length > 0 ? tarifas : null,
          }
        })
      )

      return response.json({
        success: true,
        data: configuracionesConTarifas,
      })
    } catch (error) {
      console.error('Error al obtener configuraciones:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener configuraciones del espacio',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Obtener tarifas de un espacio específico
   */
  async obtenerTarifasEspacio({ params, response }: HttpContext) {
    try {
      const espacioId = parseInt(params.espacioId)

      // Buscar la primera configuración del espacio para obtener su tarifa
      const configuracion = await db
        .from('configuraciones_espacio')
        .where('espacio_id', espacioId)
        .first()

      if (!configuracion) {
        return response.status(404).json({
          success: false,
          message: 'No hay configuración para este espacio',
        })
      }

      // Obtener la tarifa para cliente particular
      const tarifa = await db
        .from('tarifas')
        .where('configuracion_espacio_id', configuracion.id)
        .where('tipo_cliente', 'particular')
        .first()

      if (!tarifa) {
        return response.json({
          success: true,
          data: {
            precio4Horas: null,
            precio8Horas: null,
          },
        })
      }

      return response.json({
        success: true,
        data: {
          precio4Horas: tarifa.precio_4_horas ? parseFloat(tarifa.precio_4_horas) : null,
          precio8Horas: tarifa.precio_8_horas ? parseFloat(tarifa.precio_8_horas) : null,
        },
      })
    } catch (error) {
      console.error('Error al obtener tarifas:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener tarifas',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * Listar prestaciones disponibles (servicios adicionales)
   */
  async listarPrestaciones({ response }: HttpContext) {
    try {
      const prestaciones = await ServicioAdicional.query()
        .where('tipo_cliente', 'particular')
        .where('activo', true)
        .select('id', 'nombre', 'precio')

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
