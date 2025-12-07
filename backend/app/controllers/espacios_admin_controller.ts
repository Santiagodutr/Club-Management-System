import type { HttpContext } from '@adonisjs/core/http'
import Espacio from '#models/espacio'
import Disposicion from '#models/disposicion'
import ConfiguracionEspacio from '#models/configuracion_espacio'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

export default class EspaciosAdminController {
  /**
   * Listar todos los espacios con sus configuraciones
   */
  async listarEspacios({ response }: HttpContext) {
    try {
      const espacios = await Espacio.query()
        .preload('configuraciones', (query) => {
          query.preload('disposicion')
        })
        .orderBy('id', 'asc')

      return response.json({
        success: true,
        data: espacios.map(espacio => ({
          id: espacio.id,
          nombre: espacio.nombre,
          descripcion: espacio.descripcion,
          activo: espacio.activo,
          configuraciones: espacio.configuraciones.map(config => ({
            id: config.id,
            disposicionId: config.disposicionId,
            disposicionNombre: config.disposicion?.nombre || null,
            capacidad: config.capacidad,
          })),
        })),
      })
    } catch (error) {
      console.error('Error listando espacios:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener los espacios',
      })
    }
  }

  /**
   * Obtener un espacio específico con sus configuraciones
   */
  async obtenerEspacio({ params, response }: HttpContext) {
    try {
      const espacio = await Espacio.query()
        .where('id', params.id)
        .preload('configuraciones', (query) => {
          query.preload('disposicion')
        })
        .firstOrFail()

      return response.json({
        success: true,
        data: {
          id: espacio.id,
          nombre: espacio.nombre,
          descripcion: espacio.descripcion,
          activo: espacio.activo,
          configuraciones: espacio.configuraciones.map(config => ({
            id: config.id,
            disposicionId: config.disposicionId,
            disposicionNombre: config.disposicion?.nombre || null,
            capacidad: config.capacidad,
          })),
        },
      })
    } catch (error) {
      console.error('Error obteniendo espacio:', error)
      return response.status(404).json({
        success: false,
        message: 'Espacio no encontrado',
      })
    }
  }

  /**
   * Crear un nuevo espacio
   */
  async crearEspacio({ request, response }: HttpContext) {
    try {
      const schema = vine.object({
        nombre: vine.string().trim().minLength(3).maxLength(100),
        descripcion: vine.string().trim().optional(),
        activo: vine.boolean().optional(),
      })

      const data = await vine.validate({ schema, data: request.all() })

      const espacio = await Espacio.create({
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        activo: data.activo !== undefined ? data.activo : true,
      })

      return response.status(201).json({
        success: true,
        message: 'Espacio creado exitosamente',
        data: {
          id: espacio.id,
          nombre: espacio.nombre,
          descripcion: espacio.descripcion,
          activo: espacio.activo,
        },
      })
    } catch (error: any) {
      console.error('Error creando espacio:', error)
      
      if (error.messages) {
        return response.status(422).json({
          success: false,
          message: 'Errores de validación',
          errors: error.messages,
        })
      }

      return response.status(500).json({
        success: false,
        message: 'Error al crear el espacio',
      })
    }
  }

  /**
   * Actualizar un espacio
   */
  async actualizarEspacio({ params, request, response }: HttpContext) {
    try {
      const espacio = await Espacio.findOrFail(params.id)

      const schema = vine.object({
        nombre: vine.string().trim().minLength(3).maxLength(100).optional(),
        descripcion: vine.string().trim().optional(),
        activo: vine.boolean().optional(),
      })

      const data = await vine.validate({ schema, data: request.all() })

      if (data.nombre !== undefined) espacio.nombre = data.nombre
      if (data.descripcion !== undefined) espacio.descripcion = data.descripcion || null
      if (data.activo !== undefined) espacio.activo = data.activo

      await espacio.save()

      return response.json({
        success: true,
        message: 'Espacio actualizado exitosamente',
        data: {
          id: espacio.id,
          nombre: espacio.nombre,
          descripcion: espacio.descripcion,
          activo: espacio.activo,
        },
      })
    } catch (error: any) {
      console.error('Error actualizando espacio:', error)

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          message: 'Espacio no encontrado',
        })
      }

      if (error.messages) {
        return response.status(422).json({
          success: false,
          message: 'Errores de validación',
          errors: error.messages,
        })
      }

      return response.status(500).json({
        success: false,
        message: 'Error al actualizar el espacio',
      })
    }
  }

  /**
   * Agregar una configuración (disposición) a un espacio
   */
  async agregarConfiguracion({ params, request, response }: HttpContext) {
    try {
      const espacio = await Espacio.findOrFail(params.id)

      const schema = vine.object({
        disposicionId: vine.number(),
        capacidad: vine.number().min(1),
      })

      const data = await vine.validate({ schema, data: request.all() })

      // Verificar que la disposición exista
      const disposicion = await Disposicion.findOrFail(data.disposicionId)

      // Verificar que no exista ya esta configuración
      const existente = await ConfiguracionEspacio.query()
        .where('espacio_id', espacio.id)
        .where('disposicion_id', data.disposicionId)
        .first()

      if (existente) {
        return response.status(409).json({
          success: false,
          message: 'Esta disposición ya está configurada para este espacio',
        })
      }

      const configuracion = await ConfiguracionEspacio.create({
        espacioId: espacio.id,
        disposicionId: data.disposicionId,
        capacidad: data.capacidad,
      })

      // Crear tarifas si se enviaron
      const tarifas = request.input('tarifas')
      if (tarifas) {
        // Crear tarifas base para socio
        if (tarifas.socio_4h !== null || tarifas.socio_8h !== null) {
          await db.table('tarifas').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'socio',
            precio_4_horas: tarifas.socio_4h,
            precio_8_horas: tarifas.socio_8h,
            cortesia: false,
          })
        }

        // Crear tarifas base para particular
        if (tarifas.particular_4h !== null || tarifas.particular_8h !== null) {
          await db.table('tarifas').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'particular',
            precio_4_horas: tarifas.particular_4h,
            precio_8_horas: tarifas.particular_8h,
            cortesia: false,
          })
        }

        // Crear tarifas adicionales para socio
        if (tarifas.socio_adicional_4h !== null) {
          await db.table('tarifas_hora_adicional').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'socio',
            base_horas: 4,
            min_personas: 1,
            max_personas: null,
            precio: tarifas.socio_adicional_4h,
          })
        }
        if (tarifas.socio_adicional_8h !== null) {
          await db.table('tarifas_hora_adicional').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'socio',
            base_horas: 8,
            min_personas: 1,
            max_personas: null,
            precio: tarifas.socio_adicional_8h,
          })
        }

        // Crear tarifas adicionales para particular
        if (tarifas.particular_adicional_4h !== null) {
          await db.table('tarifas_hora_adicional').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'particular',
            base_horas: 4,
            min_personas: 1,
            max_personas: null,
            precio: tarifas.particular_adicional_4h,
          })
        }
        if (tarifas.particular_adicional_8h !== null) {
          await db.table('tarifas_hora_adicional').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'particular',
            base_horas: 8,
            min_personas: 1,
            max_personas: null,
            precio: tarifas.particular_adicional_8h,
          })
        }
      }

      await configuracion.load('disposicion')

      return response.status(201).json({
        success: true,
        message: 'Configuración agregada exitosamente',
        data: {
          id: configuracion.id,
          espacioId: configuracion.espacioId,
          disposicionId: configuracion.disposicionId,
          disposicionNombre: configuracion.disposicion?.nombre || null,
          capacidad: configuracion.capacidad,
        },
      })
    } catch (error: any) {
      console.error('Error agregando configuración:', error)

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          message: 'Espacio o disposición no encontrada',
        })
      }

      if (error.messages) {
        return response.status(422).json({
          success: false,
          message: 'Errores de validación',
          errors: error.messages,
        })
      }

      return response.status(500).json({
        success: false,
        message: 'Error al agregar la configuración',
      })
    }
  }

  /**
   * Actualizar una configuración existente
   */
  async actualizarConfiguracion({ params, request, response }: HttpContext) {
    try {
      const configuracion = await ConfiguracionEspacio.findOrFail(params.configId)

      const schema = vine.object({
        capacidad: vine.number().min(1),
      })

      const data = await vine.validate({ schema, data: request.all() })

      configuracion.capacidad = data.capacidad

      await configuracion.save()

      // Actualizar tarifas si se enviaron
      const tarifas = request.input('tarifas')
      if (tarifas) {
        // Eliminar tarifas existentes
        await db.from('tarifas').where('configuracion_espacio_id', configuracion.id).delete()
        await db.from('tarifas_hora_adicional').where('configuracion_espacio_id', configuracion.id).delete()

        // Crear tarifas base para socio
        if (tarifas.socio_4h !== null || tarifas.socio_8h !== null) {
          await db.table('tarifas').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'socio',
            precio_4_horas: tarifas.socio_4h,
            precio_8_horas: tarifas.socio_8h,
            cortesia: false,
          })
        }

        // Crear tarifas base para particular
        if (tarifas.particular_4h !== null || tarifas.particular_8h !== null) {
          await db.table('tarifas').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'particular',
            precio_4_horas: tarifas.particular_4h,
            precio_8_horas: tarifas.particular_8h,
            cortesia: false,
          })
        }

        // Crear tarifas adicionales para socio
        if (tarifas.socio_adicional_4h !== null) {
          await db.table('tarifas_hora_adicional').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'socio',
            base_horas: 4,
            min_personas: 1,
            max_personas: null,
            precio: tarifas.socio_adicional_4h,
          })
        }
        if (tarifas.socio_adicional_8h !== null) {
          await db.table('tarifas_hora_adicional').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'socio',
            base_horas: 8,
            min_personas: 1,
            max_personas: null,
            precio: tarifas.socio_adicional_8h,
          })
        }

        // Crear tarifas adicionales para particular
        if (tarifas.particular_adicional_4h !== null) {
          await db.table('tarifas_hora_adicional').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'particular',
            base_horas: 4,
            min_personas: 1,
            max_personas: null,
            precio: tarifas.particular_adicional_4h,
          })
        }
        if (tarifas.particular_adicional_8h !== null) {
          await db.table('tarifas_hora_adicional').insert({
            configuracion_espacio_id: configuracion.id,
            tipo_cliente: 'particular',
            base_horas: 8,
            min_personas: 1,
            max_personas: null,
            precio: tarifas.particular_adicional_8h,
          })
        }
      }

      await configuracion.load('disposicion')

      return response.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: {
          id: configuracion.id,
          espacioId: configuracion.espacioId,
          disposicionId: configuracion.disposicionId,
          disposicionNombre: configuracion.disposicion?.nombre || null,
          capacidad: configuracion.capacidad,
        },
      })
    } catch (error: any) {
      console.error('Error actualizando configuración:', error)

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
        })
      }

      if (error.messages) {
        return response.status(422).json({
          success: false,
          message: 'Errores de validación',
          errors: error.messages,
        })
      }

      return response.status(500).json({
        success: false,
        message: 'Error al actualizar la configuración',
      })
    }
  }

  /**
   * Eliminar una configuración
   */
  async eliminarConfiguracion({ params, response }: HttpContext) {
    try {
      const configuracion = await ConfiguracionEspacio.findOrFail(params.configId)
      await configuracion.delete()

      return response.json({
        success: true,
        message: 'Configuración eliminada exitosamente',
      })
    } catch (error: any) {
      console.error('Error eliminando configuración:', error)

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
        })
      }

      return response.status(500).json({
        success: false,
        message: 'Error al eliminar la configuración',
      })
    }
  }

  /**
   * Listar todas las disposiciones disponibles
   */
  async listarDisposiciones({ response }: HttpContext) {
    try {
      const disposiciones = await Disposicion.query().orderBy('nombre', 'asc')

      return response.json({
        success: true,
        data: disposiciones.map(d => ({
          id: d.id,
          nombre: d.nombre,
        })),
      })
    } catch (error) {
      console.error('Error listando disposiciones:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener las disposiciones',
      })
    }
  }

  /**
   * Crear una nueva disposición
   */
  async crearDisposicion({ request, response }: HttpContext) {
    try {
      const schema = vine.object({
        nombre: vine.string().trim().minLength(3).maxLength(100),
      })

      const data = await vine.validate({ schema, data: request.all() })

      // Verificar que no exista una disposición con el mismo nombre
      const existente = await Disposicion.query()
        .whereRaw('LOWER(nombre) = ?', [data.nombre.toLowerCase()])
        .first()

      if (existente) {
        return response.status(409).json({
          success: false,
          message: 'Ya existe una disposición con ese nombre',
        })
      }

      const disposicion = await Disposicion.create({
        nombre: data.nombre,
      })

      return response.status(201).json({
        success: true,
        message: 'Disposición creada exitosamente',
        data: {
          id: disposicion.id,
          nombre: disposicion.nombre,
        },
      })
    } catch (error: any) {
      console.error('Error creando disposición:', error)

      if (error.messages) {
        return response.status(422).json({
          success: false,
          message: 'Errores de validación',
          errors: error.messages,
        })
      }

      return response.status(500).json({
        success: false,
        message: 'Error al crear la disposición',
      })
    }
  }

  /**
   * Actualizar una disposición
   */
  async actualizarDisposicion({ params, request, response }: HttpContext) {
    try {
      const disposicion = await Disposicion.findOrFail(params.id)

      const schema = vine.object({
        nombre: vine.string().trim().minLength(3).maxLength(100),
      })

      const data = await vine.validate({ schema, data: request.all() })

      // Verificar que no exista otro con ese nombre
      if (data.nombre.toLowerCase() !== disposicion.nombre.toLowerCase()) {
        const existente = await Disposicion.query()
          .whereRaw('LOWER(nombre) = ?', [data.nombre.toLowerCase()])
          .whereNot('id', disposicion.id)
          .first()

        if (existente) {
          return response.status(409).json({
            success: false,
            message: 'Ya existe una disposición con ese nombre',
          })
        }
      }

      disposicion.nombre = data.nombre

      await disposicion.save()

      return response.json({
        success: true,
        message: 'Disposición actualizada exitosamente',
        data: {
          id: disposicion.id,
          nombre: disposicion.nombre,
        },
      })
    } catch (error: any) {
      console.error('Error actualizando disposición:', error)

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          message: 'Disposición no encontrada',
        })
      }

      if (error.messages) {
        return response.status(422).json({
          success: false,
          message: 'Errores de validación',
          errors: error.messages,
        })
      }

      return response.status(500).json({
        success: false,
        message: 'Error al actualizar la disposición',
      })
    }
  }
}
