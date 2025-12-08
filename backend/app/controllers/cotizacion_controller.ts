import type { HttpContext } from '@adonisjs/core/http'
import Cotizacion from '#models/cotizacion'
import DatosEmpresa from '#models/datos_empresa'
import { PDFService } from '#services/pdf_service'
import { CotizacionService, type SolicitudCotizacion } from '#services/cotizacion_service'
import { EmailService, type DatosCotizacionEmail } from '#services/email_service'
import WhatsAppService from '#services/whatsapp_service'
import vine from '@vinejs/vine'
import { DateTime } from 'luxon'
import { cotizacionConfig } from '#config/app'

export default class CotizacionController {
  /**
   * Crear una nueva cotización
   */
  async crearCotizacion({ request, response }: HttpContext) {
    try {
      const schema = vine.object({
        espacioId: vine.number(),
        configuracionEspacioId: vine.number(),
        fecha: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        horaInicio: vine.string().regex(/^\d{2}:\d{2}$/), // HH:mm
        duracion: vine.number().min(4).max(8), // Máximo 8 horas (base), horas adicionales se cobran aparte
        tipoEvento: vine.enum(['social', 'empresarial', 'capacitacion']),
        asistentes: vine.number().min(1),
        tipoCliente: vine.enum(['socio', 'particular']),
        codigoSocio: vine.string().optional(), // Código del socio para descuentos
        servicios: vine.array(vine.number()).optional(),
        nombre: vine.string().trim().minLength(3),
        email: vine.string().email(),
        telefono: vine.string().trim().optional(),
        observaciones: vine.string().trim().optional(),
      })

      const data = await vine.validate({ schema, data: request.all() })

      console.log('📋 Datos recibidos en crearCotizacion:', {
        tipoCliente: data.tipoCliente,
        codigoSocio: data.codigoSocio,
        nombre: data.nombre,
      })

      // Validación manual de fecha después de vine
      const fecha = DateTime.fromISO(data.fecha, { zone: 'America/Bogota' })
      if (!fecha.isValid) {
        return response.badRequest({
          success: false,
          message: 'La fecha proporcionada no es válida',
        })
      }

      const hoy = DateTime.now().setZone('America/Bogota').startOf('day')
      const fechaMinima = cotizacionConfig.permitirHoy ? hoy : hoy.plus({ days: 1 })
      const fechaMaxima = hoy.plus({ days: cotizacionConfig.diasMaximosFuturo })

      if (fecha < fechaMinima) {
        const mensaje = cotizacionConfig.permitirHoy
          ? 'La fecha debe ser hoy o posterior'
          : 'La fecha debe ser posterior a hoy'
        return response.badRequest({
          success: false,
          message: mensaje,
        })
      }

      if (fecha > fechaMaxima) {
        return response.badRequest({
          success: false,
          message: `La fecha no puede ser mayor a ${cotizacionConfig.diasMaximosFuturo} días en el futuro`,
        })
      }

      // Crear cotización directamente (sin validar socio, ya que todos tienen mismo precio)
      const solicitud: SolicitudCotizacion = {
        espacioId: data.espacioId,
        configuracionEspacioId: data.configuracionEspacioId,
        fecha: data.fecha,
        horaInicio: data.horaInicio,
        duracion: data.duracion,
        tipoEvento: data.tipoEvento,
        asistentes: data.asistentes,
        tipoCliente: data.tipoCliente,
        codigoSocio: data.codigoSocio,
        servicios: data.servicios || [],
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        observaciones: data.observaciones,
      }

      const resultado = await CotizacionService.crearCotizacion(solicitud)

      console.log('Resultado cotización:', {
        disponible: resultado.disponible,
        valorTotal: resultado.cotizacion.valorTotal,
        montoAbono: resultado.montoAbono,
        detallesCount: resultado.detalles.length,
        mensaje: resultado.mensajeDisponibilidad,
      })

      // Preload espacio relation to get salon name
      await resultado.cotizacion.load('espacio')
      const salonNombre = resultado.cotizacion.espacio?.nombre || null

      // Enviar correos de notificación (async, no bloqueante)
      const datosEmail: DatosCotizacionEmail = {
        cotizacionId: resultado.cotizacion.id,
        nombreCliente: resultado.cotizacion.nombre,
        emailCliente: resultado.cotizacion.email,
        telefonoCliente: resultado.cotizacion.telefono,
        salon: salonNombre,
        fecha: resultado.cotizacion.fecha,
        hora: resultado.cotizacion.hora,
        duracion: resultado.cotizacion.duracion,
        asistentes: resultado.cotizacion.asistentes,
        tipoEvento: resultado.cotizacion.tipoEvento || 'No especificado',
        valorTotal: Number(resultado.cotizacion.valorTotal),
        montoAbono: resultado.montoAbono,
      }

      // Enviar emails en background (no esperar respuesta)
      EmailService.enviarCorreosCotizacion(datosEmail)
        .then((res) => {
          console.log('📧 Resultado envío emails:', res)
        })
        .catch((err) => {
          console.error('📧 Error enviando emails:', err)
        })

      // Generar PDF y enviar por WhatsApp si hay teléfono del cliente
      if (resultado.cotizacion.telefono) {
        const whatsappService = new WhatsAppService()

        // Generar PDF en background
        PDFService
          .generarPDF(resultado.cotizacion)
          .then(async (pdfBuffer) => {
            // Subir PDF a Supabase para obtener URL pública
            const { supabase } = await import('#services/supabase_service')
            const filename = `cotizacion_${resultado.cotizacion.id}_${Date.now()}.pdf`
            
            const { error: uploadError } = await supabase.storage
              .from('cotizaciones_pdf')
              .upload(filename, pdfBuffer, {
                contentType: 'application/pdf',
                cacheControl: '3600',
              })

            if (uploadError) {
              console.error('❌ Error subiendo PDF a Supabase:', uploadError)
              return
            }

            // Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
              .from('cotizaciones_pdf')
              .getPublicUrl(filename)

            console.log('📄 PDF generado y subido:', { filename, publicUrl })

            // Verificar que la URL sea accesible
            try {
              const testResponse = await fetch(publicUrl, { method: 'HEAD' })
              console.log('🔍 Verificación de URL pública:', {
                url: publicUrl,
                status: testResponse.status,
                contentType: testResponse.headers.get('content-type'),
                accessible: testResponse.ok,
              })
              
              if (!testResponse.ok) {
                console.error('❌ La URL del PDF no es accesible públicamente. Verifica que el bucket de Supabase sea público.')
                return
              }
            } catch (error) {
              console.error('❌ Error verificando acceso a URL del PDF:', error)
              return
            }

            // Obtener teléfono del gerente desde la base de datos
            const datosEmpresa = await DatosEmpresa.findBy('key', 'empresa')
            if (!datosEmpresa?.whatsappGerente) {
              console.warn('⚠️ No hay teléfono de gerente configurado en datos_empresa')
              return
            }

            // Enviar por WhatsApp: puedes elegir entre botón o documento directo
            const telefonoCliente = whatsappService.formatPhoneNumber(resultado.cotizacion.telefono!)
            const telefonoGerente = whatsappService.formatPhoneNumber(datosEmpresa.whatsappGerente)

            console.log('📞 Números de teléfono formateados:', {
              clienteOriginal: resultado.cotizacion.telefono,
              clienteFormateado: telefonoCliente,
              gerenteOriginal: datosEmpresa.whatsappGerente,
              gerenteFormateado: telefonoGerente,
            })

            // Calcular hora de fin
            const [horaInicio, minutosInicio] = resultado.cotizacion.hora.split(':').map(Number)
            const horaFin = `${String((horaInicio + resultado.cotizacion.duracion) % 24).padStart(2, '0')}:${String(minutosInicio).padStart(2, '0')}`

            // Formatear fecha
            const fechaFormateada = DateTime.fromISO(resultado.cotizacion.fecha).setLocale('es').toFormat('dd/MM/yyyy')

            // Opción 1: Enviar documento directamente (aparece como archivo adjunto)
            const resultadoWhatsApp = await whatsappService.enviarCotizacionConDocumento(
              telefonoCliente,
              telefonoGerente,
              publicUrl,
              resultado.cotizacion.id.toString(),
              {
                salon: salonNombre || 'No especificado',
                fecha: fechaFormateada,
                horaInicio: resultado.cotizacion.hora,
                horaFin: horaFin,
                valorTotal: Number(resultado.cotizacion.valorTotal),
                nombreCliente: resultado.cotizacion.nombre,
                emailCliente: resultado.cotizacion.email,
              }
            )

            // Opción 2: Enviar con botón interactivo (descomenta para usar)
            // const resultadoWhatsApp = await whatsappService.enviarCotizacionConLink(
            //   telefonoCliente,
            //   telefonoGerente,
            //   publicUrl,
            //   resultado.cotizacion.id.toString()
            // )

            console.log('📱 Resultado envío WhatsApp:', resultadoWhatsApp)
          })
          .catch((err) => {
            console.error('📱 Error enviando WhatsApp:', err)
          })
      }

      // Refrescar vista materializada en background (no bloquear respuesta)
      this.refreshStatsAsync()

      return response.status(201).json({
        success: true,
        message: 'Cotización creada exitosamente',
        data: {
          cotizacion: resultado.cotizacion,
          detalles: resultado.detalles,
          montoAbono: resultado.montoAbono,
          disponible: resultado.disponible,
          mensajeDisponibilidad: resultado.mensajeDisponibilidad,
        },
      })
    } catch (error) {
      console.error('Error creando cotización:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al crear la cotización',
        error: error.message,
      })
    }
  }

  /**
   * Refrescar vista materializada de forma asíncrona
   */
  private async refreshStatsAsync() {
    try {
      const db = (await import('@adonisjs/lucid/services/db')).default
      await db.rawQuery('SELECT refresh_cotizaciones_summary()')
    } catch (error) {
      console.error('Error refrescando stats:', error)
      // No lanzar error, es background task
    }
  }

  /**
   * Listar cotizaciones con filtros avanzados
   */
  async listarCotizaciones({ request, response }: HttpContext) {
    try {
      const {
        estado,
        estado_pago,
        email,
        fecha,
        fecha_desde,
        fecha_hasta,
        hora_desde,
        hora_hasta,
        espacio_id,
        tipo_evento,
        buscar,
        limit = 100,
        page = 1,
      } = request.qs()

      let query = Cotizacion.query()

      // Filtro por email del cliente
      if (email) {
        query = query.where('email', 'like', `%${email}%`)
      }

      // Filtro por nombre del cliente (búsqueda)
      if (buscar) {
        query = query.where((builder) => {
          builder
            .where('nombre', 'like', `%${buscar}%`)
            .orWhere('email', 'like', `%${buscar}%`)
            .orWhere('telefono', 'like', `%${buscar}%`)
        })
      }

      // Filtro por estado (pendiente, aceptada, rechazada, cancelada, expirada)
      if (estado) {
        query = query.where('estado', estado)
      }

      // Filtro por estado de pago (pendiente, abonado, pagado)
      if (estado_pago) {
        query = query.where('estado_pago', estado_pago)
      }

      // Filtro por fecha exacta
      if (fecha) {
        query = query.where('fecha', fecha)
      }

      // Filtro por rango de fechas
      if (fecha_desde) {
        query = query.whereRaw('DATE(fecha) >= ?', [fecha_desde])
      }

      if (fecha_hasta) {
        query = query.whereRaw('DATE(fecha) <= ?', [fecha_hasta])
      }

      // Filtro por rango de horas
      if (hora_desde) {
        query = query.where('hora', '>=', hora_desde)
      }

      if (hora_hasta) {
        query = query.where('hora', '<=', hora_hasta)
      }

      // Filtro por espacio/salón
      if (espacio_id) {
        query = query.where('espacio_id', espacio_id)
      }

      // Filtro por tipo de evento
      if (tipo_evento) {
        query = query.where('tipo_evento', tipo_evento)
      }

      // Paginación
      const limitNum = Math.min(parseInt(limit as string) || 100, 500)
      const pageNum = Math.max(parseInt(page as string) || 1, 1)
      const offset = (pageNum - 1) * limitNum

      // Obtener total de registros
      const totalQuery = query.clone()
      const total = await totalQuery.count('* as total')
      const totalRecords = Number(total[0]?.$extras?.total || 0)

      // Obtener cotizaciones con paginación y eager loading (optimizado)
      // Solo seleccionar campos necesarios para la lista
      const cotizaciones = await query
        .select([
          'id',
          'cotizacion_numero',
          'nombre',
          'email',
          'telefono',
          'fecha',
          'hora',
          'duracion',
          'asistentes',
          'tipo_evento',
          'tipo_cliente',
          'espacio_id',
          'valor_total',
          'monto_abono',
          'monto_pagado',
          'estado',
          'estado_pago',
          'created_at',
          'updated_at'
        ])
        .preload('espacio', (espacioQuery) => {
          espacioQuery.select('id', 'nombre')
        })
        .orderBy('fecha', 'desc')
        .orderBy('hora', 'desc')
        .orderBy('created_at', 'desc')
        .limit(limitNum)
        .offset(offset)

      return response.json({
        success: true,
        data: cotizaciones.map((c) => ({
          id: c.id,
          numero: c.cotizacionNumero,
          cliente: {
            nombre: c.nombre,
            email: c.email,
            telefono: c.telefono,
          },
          evento: {
            fecha: c.fecha,
            hora: c.hora,
            duracion: c.duracion,
            asistentes: c.asistentes,
            tipo: c.tipoEvento,
            salon: c.espacio?.nombre || null,
            espacio_id: c.espacioId,
          },
          tipoCliente: c.tipoCliente,
          totales: {
            valor_total: c.valorTotal,
            abono_requerido: c.calcularMontoAbono(),
            total_pagado: c.montoPagado,
            saldo_pendiente: typeof c.valorTotal === 'string' 
              ? parseFloat(c.valorTotal) - (typeof c.montoPagado === 'string' ? parseFloat(c.montoPagado) : c.montoPagado)
              : c.valorTotal - (typeof c.montoPagado === 'string' ? parseFloat(c.montoPagado) : c.montoPagado),
          },
          estado: c.estado,
          estado_legible: c.estadoLegible,
          estado_pago: c.estadoPago,
          estado_pago_legible: c.estadoPagoLegible,
          monto_pagado: c.montoPagado,
          fecha_creacion: c.createdAt,
          fecha_actualizacion: c.updatedAt,
        })),
        pagination: {
          total: totalRecords,
          per_page: limitNum,
          current_page: pageNum,
          last_page: Math.ceil(totalRecords / limitNum),
          from: totalRecords > 0 ? offset + 1 : 0,
          to: Math.min(offset + limitNum, totalRecords),
        },
      })
    } catch (error: any) {
      console.error('Error listando cotizaciones:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al listar cotizaciones',
        error: error.message,
      })
    }
  }

  /**
   * Obtener detalle de una cotización
   */
  async mostrarCotizacion({ params, response }: HttpContext) {
    try {
      const cotizacion = await Cotizacion.findOrFail(params.id)

      return response.json({
        success: true,
        data: {
          id: cotizacion.id,
          numero: cotizacion.cotizacionNumero,
          // IDs necesarios para edición
          espacioId: cotizacion.espacioId,
          configuracionEspacioId: cotizacion.configuracionEspacioId,
          disposicionId: cotizacion.disposicionId,
          serviciosIds: cotizacion.prestaciones || [], // Array de IDs de servicios
          tipoCliente: cotizacion.tipoCliente,
          codigoSocio: cotizacion.codigoSocio,
          cliente: {
            nombre: cotizacion.nombre,
            email: cotizacion.email,
            telefono: cotizacion.telefono,
          },
          evento: {
            fecha: cotizacion.fecha,
            hora: cotizacion.hora,
            duracion: cotizacion.duracion,
            asistentes: cotizacion.asistentes,
            tipo: cotizacion.tipoEvento,
          },
          detalles: cotizacion.getDetalles(),
          totales: {
            subtotal: cotizacion.valorTotal,
            valor_total: cotizacion.valorTotal,
            abono_50_porciento: cotizacion.calcularMontoAbono(),
            abono_requerido: cotizacion.calcularMontoAbono(),
            total_pagado: cotizacion.montoPagado,
            saldo_pendiente: typeof cotizacion.valorTotal === 'string' 
              ? parseFloat(cotizacion.valorTotal) - (typeof cotizacion.montoPagado === 'string' ? parseFloat(cotizacion.montoPagado) : cotizacion.montoPagado)
              : cotizacion.valorTotal - (typeof cotizacion.montoPagado === 'string' ? parseFloat(cotizacion.montoPagado) : cotizacion.montoPagado),
          },
          estado: cotizacion.estadoLegible,
          estado_pago: cotizacion.estadoPagoLegible,
          creado: cotizacion.createdAt,
          observaciones: cotizacion.observaciones,
        },
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Cotización no encontrada',
      })
    }
  }

  /**
   * Actualizar/Editar cotización existente
   * PUT /api/cotizaciones/:id
   */
  async actualizarCotizacion({ params, request, response }: HttpContext) {
    try {
      const cotizacion = await Cotizacion.findOrFail(params.id)

      // No permitir editar cotizaciones cerradas/aceptadas
      if (cotizacion.estado === 'aceptada') {
        return response.status(400).json({
          success: false,
          message: 'No se puede editar una cotización ya aceptada (cerrada)',
        })
      }

      const schema = vine.object({
        espacioId: vine.number().optional(),
        configuracionEspacioId: vine.number().optional(),
        fecha: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        horaInicio: vine.string().regex(/^\d{2}:\d{2}$/).optional(),
        duracion: vine.number().min(1).optional(), // Gerente puede poner cualquier duración
        tipoEvento: vine.enum(['social', 'empresarial', 'capacitacion']).optional(),
        asistentes: vine.number().min(1).optional(),
        tipoCliente: vine.enum(['socio', 'particular']).optional(),
        servicios: vine.array(vine.number()).optional(),
        nombre: vine.string().trim().minLength(3).optional(),
        email: vine.string().email().optional(),
        telefono: vine.string().trim().optional(),
        observaciones: vine.string().trim().optional(),
      })

      const data = await vine.validate({ schema, data: request.all() })

      // Validación manual de fecha si fue proporcionada
      if (data.fecha) {
        const fecha = DateTime.fromISO(data.fecha, { zone: 'America/Bogota' })
        if (!fecha.isValid) {
          return response.badRequest({
            success: false,
            message: 'La fecha proporcionada no es válida',
          })
        }

        const hoy = DateTime.now().setZone('America/Bogota').startOf('day')
        const fechaMinima = cotizacionConfig.permitirHoy ? hoy : hoy.plus({ days: 1 })
        const fechaMaxima = hoy.plus({ days: cotizacionConfig.diasMaximosFuturo })

        if (fecha < fechaMinima) {
          const mensaje = cotizacionConfig.permitirHoy
            ? 'La fecha debe ser hoy o posterior'
            : 'La fecha debe ser posterior a hoy'
          return response.badRequest({
            success: false,
            message: mensaje,
          })
        }

        if (fecha > fechaMaxima) {
          return response.badRequest({
            success: false,
            message: `La fecha no puede ser mayor a ${cotizacionConfig.diasMaximosFuturo} días en el futuro`,
          })
        }
      }

      // Si se cambian datos del evento, recalcular cotización
      const cambiaEvento = data.espacioId || data.configuracionEspacioId || data.fecha || 
                          data.horaInicio || data.duracion || data.asistentes || data.servicios

      if (cambiaEvento) {
        const solicitud: SolicitudCotizacion = {
          espacioId: data.espacioId || cotizacion.espacioId!,
          configuracionEspacioId: data.configuracionEspacioId || cotizacion.configuracionEspacioId!,
          fecha: data.fecha || cotizacion.fecha,
          horaInicio: data.horaInicio || cotizacion.hora,
          duracion: data.duracion || cotizacion.duracion,
          tipoEvento: (data.tipoEvento || cotizacion.tipoEvento) as 'social' | 'empresarial' | 'capacitacion',
          asistentes: data.asistentes || cotizacion.asistentes,
          tipoCliente: (data.tipoCliente || 'particular') as 'socio' | 'particular',
          servicios: data.servicios || (cotizacion.prestaciones as number[]) || [],
          nombre: data.nombre || cotizacion.nombre,
          email: data.email || cotizacion.email,
          telefono: data.telefono || cotizacion.telefono || undefined,
          observaciones: data.observaciones || cotizacion.observaciones || undefined,
        }

        // Usar recalcularCotizacion en lugar de crearCotizacion (que duplicaba)
        const resultado = await CotizacionService.recalcularCotizacion(solicitud)
        
        if (!resultado.disponible) {
          return response.status(400).json({
            success: false,
            message: resultado.mensajeDisponibilidad,
          })
        }
        
        console.log('[Actualizar] Resultado recalculo:', {
          valorTotal: resultado.valorTotal,
          detallesCount: resultado.detalles.length,
          detalles: resultado.detalles,
        })
        
        // Actualizar cotización existente con nuevos valores
        cotizacion.merge({
          espacioId: solicitud.espacioId,
          configuracionEspacioId: solicitud.configuracionEspacioId,
          disposicionId: resultado.disposicionId,
          fecha: solicitud.fecha,
          hora: solicitud.horaInicio,
          duracion: solicitud.duracion,
          asistentes: solicitud.asistentes,
          tipoEvento: solicitud.tipoEvento,
          prestaciones: solicitud.servicios,
          valorTotal: resultado.valorTotal,
          detalles: resultado.detalles,
          horasAdicionalesAplicadas: resultado.horasAdicionalesAplicadas,
          recargoNocturnoAplicado: resultado.recargoNocturnoAplicado,
        })
        
        console.log('[Actualizar] Cotización después de merge:', {
          valorTotal: cotizacion.valorTotal,
          detalles: cotizacion.detalles,
        })
      }

      // Actualizar datos de contacto si se proveen
      if (data.nombre) cotizacion.nombre = data.nombre
      if (data.email) cotizacion.email = data.email
      if (data.telefono !== undefined) cotizacion.telefono = data.telefono
      if (data.observaciones !== undefined) cotizacion.observaciones = data.observaciones

      await cotizacion.save()

      return response.json({
        success: true,
        message: 'Cotización actualizada exitosamente',
        data: {
          cotizacion,
          detalles: cotizacion.getDetalles(),
          montoAbono: cotizacion.calcularMontoAbono(),
        },
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al actualizar la cotización',
        error: error.message,
      })
    }
  }

  /**
   * Cerrar cotización y convertir en reserva (con pago de abono o completo)
   * POST /api/cotizaciones/:id/cerrar
   */
  async cerrarCotizacion({ params, request, response }: HttpContext) {
    try {
      const cotizacion = await Cotizacion.query()
        .where('id', params.id)
        .preload('espacio')
        .firstOrFail()

      if (cotizacion.estado === 'aceptada') {
        return response.status(400).json({
          success: false,
          message: 'La cotización ya está cerrada',
        })
      }

      const schema = vine.object({
        estadoPago: vine.enum(['abonado', 'pagado']),
        montoPago: vine.number().min(0).optional(),
      })

      const data = await vine.validate({ schema, data: request.all() })

      // Calcular monto automáticamente si no se proporciona
      const total = parseFloat(cotizacion.valorTotal.toString())
      const abono50 = cotizacion.calcularMontoAbono()
      
      let montoPago: number
      if (data.montoPago !== undefined && data.montoPago !== null) {
        montoPago = data.montoPago
      } else {
        // Si no se proporciona monto, asignar según estado de pago
        montoPago = data.estadoPago === 'pagado' ? total : abono50
      }

      // Validar monto según estado de pago
      if (data.estadoPago === 'abonado' && montoPago < abono50) {
        return response.status(400).json({
          success: false,
          message: `Para cerrar como "abonado" debe pagar mínimo el 50% ($${abono50.toLocaleString('es-CO')})`,
        })
      }

      if (data.estadoPago === 'pagado' && montoPago < total) {
        return response.status(400).json({
          success: false,
          message: `Para cerrar como "pagado" debe pagar el 100% ($${total.toLocaleString('es-CO')})`,
        })
      }

      // Cerrar cotización y crear bloqueo
      await CotizacionService.confirmarCotizacion(cotizacion.id)
      
      // Actualizar pago
      cotizacion.montoPagado = montoPago
      cotizacion.estadoPago = data.estadoPago
      
      await cotizacion.save()
      await cotizacion.refresh()

      // Cancelar automáticamente cotizaciones que se crucen
      const cotizacionesCanceladas = await CotizacionService.cancelarCotizacionesCruzadas(
        cotizacion.espacioId!,
        cotizacion.fecha,
        cotizacion.hora,
        cotizacion.duracion,
        cotizacion.id
      )

      // Enviar notificación de confirmación al cliente
      await EmailService.enviarNotificacionConfirmacion({
        nombreCliente: cotizacion.nombre,
        emailCliente: cotizacion.email,
        cotizacionId: cotizacion.id,
        salon: cotizacion.espacio?.nombre || 'N/A',
        fecha: cotizacion.fecha,
        hora: cotizacion.hora,
        duracion: cotizacion.duracion,
        valorTotal: parseFloat(cotizacion.valorTotal.toString()),
        montoPagado: montoPago,
        estadoPago: data.estadoPago,
      })

      return response.json({
        success: true,
        message: `Cotización cerrada exitosamente como reserva. ${cotizacionesCanceladas} cotización(es) conflictivas canceladas. Se ha notificado al cliente por correo.`,
        data: {
          id: cotizacion.id,
          numero: cotizacion.cotizacionNumero,
          estado: cotizacion.estadoLegible,
          estadoPago: cotizacion.estadoPagoLegible,
          montoPagado: cotizacion.montoPagado,
          fechaConfirmacion: cotizacion.fechaConfirmacion,
          cotizacionesCanceladas,
        },
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al cerrar la cotización',
        error: error.message,
      })
    }
  }

  /**
   * Rechazar cotización manualmente (gerente)
   * POST /api/cotizaciones/:id/rechazar
   */
  async rechazarCotizacion({ params, request, response }: HttpContext) {
    try {
      const cotizacion = await Cotizacion.query()
        .where('id', params.id)
        .preload('espacio')
        .firstOrFail()

      if (cotizacion.estado !== 'pendiente') {
        return response.status(400).json({
          success: false,
          message: 'Solo se pueden rechazar cotizaciones pendientes',
        })
      }

      const schema = vine.object({
        motivo: vine.string().trim().optional(),
      })

      const data = await vine.validate({ schema, data: request.all() })

      cotizacion.estado = 'rechazada'
      cotizacion.observaciones = data.motivo
        ? `[GERENTE] ${data.motivo}`
        : '[GERENTE] Cotización rechazada'
      await cotizacion.save()

      // Enviar notificación al cliente
      await EmailService.enviarNotificacionCancelacion({
        nombreCliente: cotizacion.nombre,
        emailCliente: cotizacion.email,
        cotizacionId: cotizacion.id,
        salon: cotizacion.espacio?.nombre || 'N/A',
        fecha: cotizacion.fecha,
        hora: cotizacion.hora,
        motivo: data.motivo || 'El gerente ha decidido no procesar esta cotización',
        tipoRechazo: 'manual',
      })

      return response.json({
        success: true,
        message: 'Cotización rechazada. Se ha notificado al cliente por correo.',
        data: {
          id: cotizacion.id,
          numero: cotizacion.cotizacionNumero,
          estado: cotizacion.estadoLegible,
        },
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al rechazar la cotización',
        error: error.message,
      })
    }
  }

  /**
   * Registrar pago adicional después de cerrar cotización
   * POST /api/cotizaciones/:id/registrar-pago
   */
  async registrarPagoAdicional({ params, request, response }: HttpContext) {
    try {
      const schema = vine.object({
        monto: vine.number().min(0),
        metodoPago: vine.string().trim().optional(),
        observaciones: vine.string().trim().optional(),
      })

      const data = await vine.validate({ schema, data: request.all() })

      const cotizacion = await Cotizacion.findOrFail(params.id)

      if (cotizacion.estado !== 'aceptada') {
        return response.status(400).json({
          success: false,
          message: 'Solo se pueden registrar pagos en cotizaciones cerradas (aceptadas)',
        })
      }

      const montoPagado = parseFloat(data.monto.toString())
      const totalPagado = (parseFloat(cotizacion.montoPagado.toString()) || 0) + montoPagado
      const total = parseFloat(cotizacion.valorTotal.toString())

      if (totalPagado > total) {
        return response.status(400).json({
          success: false,
          message: `El monto total pagado ($${totalPagado.toLocaleString('es-CO')}) excedería el valor total ($${total.toLocaleString('es-CO')})`,
        })
      }

      // Actualizar estado de pago
      cotizacion.montoPagado = totalPagado

      if (totalPagado >= total) {
        cotizacion.estadoPago = 'pagado'
      } else if (totalPagado >= cotizacion.calcularMontoAbono()) {
        cotizacion.estadoPago = 'abonado'
      }

      await cotizacion.save()

      return response.json({
        success: true,
        message: 'Pago registrado exitosamente',
        data: {
          id: cotizacion.id,
          estadoPago: cotizacion.estadoPagoLegible,
          montoPagado: cotizacion.montoPagado,
          valorTotal: cotizacion.valorTotal,
        },
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al registrar el pago',
        error: error.message,
      })
    }
  }

  /**
   * Descargar cotización en PDF
   */
  async descargarPDF({ params, response }: HttpContext) {
    try {
      const cotizacion = await Cotizacion.findOrFail(params.id)

      const pdfBuffer = await PDFService.generarPDF(cotizacion)

      response.header('Content-Type', 'application/pdf')
      response.header(
        'Content-Disposition',
        `inline; filename="Cotizacion-${cotizacion.id}.pdf"`
      )

      return response.send(pdfBuffer)
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al generar el documento',
        error: error instanceof Error ? error.message : 'desconocido',
      })
    }
  }

  /**
   * Endpoint de prueba: enviar correos de una cotización existente
   * POST /api/cotizaciones/:id/enviar-correo
   */
  async enviarCorreoPrueba({ params, response }: HttpContext) {
    try {
      const cotizacion = await Cotizacion.query()
        .where('id', params.id)
        .preload('espacio')
        .firstOrFail()

      const salonNombre = cotizacion.espacio?.nombre || null

      const datosEmail: DatosCotizacionEmail = {
        cotizacionId: cotizacion.id,
        nombreCliente: cotizacion.nombre,
        emailCliente: cotizacion.email,
        telefonoCliente: cotizacion.telefono,
        salon: salonNombre,
        fecha: cotizacion.fecha,
        hora: cotizacion.hora,
        duracion: cotizacion.duracion,
        asistentes: cotizacion.asistentes,
        tipoEvento: cotizacion.tipoEvento || 'No especificado',
        valorTotal: Number(cotizacion.valorTotal),
        montoAbono: cotizacion.calcularMontoAbono(),
      }

      // Enviar correos
      const resultadoEmail = await EmailService.enviarCorreosCotizacion(datosEmail)

      // Enviar WhatsApp si hay teléfono
      let resultadoWhatsApp = null
      if (cotizacion.telefono) {
        try {
          const whatsappService = new WhatsAppService()
          
          // Obtener datos empresa para teléfono del gerente
          const datosEmpresa = await DatosEmpresa.findBy('key', 'empresa')
          if (!datosEmpresa?.whatsappGerente) {
            console.warn('⚠️ No hay teléfono de gerente configurado')
          } else {
            // Generar PDF
            const pdfBuffer = await PDFService.generarPDF(cotizacion)
            
            // Subir a Supabase Storage
            const { supabase } = await import('#services/supabase_service')
            const filename = `cotizacion_${cotizacion.id}_${Date.now()}.pdf`
            
            const { error: uploadError } = await supabase.storage
              .from('cotizaciones_pdf')
              .upload(filename, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true,
              })

            if (uploadError) {
              console.error('❌ Error subiendo PDF:', uploadError)
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('cotizaciones_pdf')
                .getPublicUrl(filename)
              
              const telefonoCliente = whatsappService.formatPhoneNumber(cotizacion.telefono)
              const telefonoGerente = whatsappService.formatPhoneNumber(datosEmpresa.whatsappGerente)
              
              resultadoWhatsApp = await whatsappService.enviarCotizacion(
                telefonoCliente,
                telefonoGerente,
                publicUrl,
                cotizacion.cotizacionNumero
              )
            }
          }
        } catch (whatsappError) {
          console.error('Error enviando WhatsApp:', whatsappError)
          // No fallar si WhatsApp falla, continuar con respuesta exitosa
        }
      }

      return response.json({
        success: true,
        message: 'Notificaciones enviadas correctamente',
        data: {
          email: resultadoEmail,
          whatsapp: resultadoWhatsApp,
        },
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al enviar notificaciones',
        error: error instanceof Error ? error.message : 'desconocido',
      })
    }
  }

  /**
   * Eliminar cotización
   * DELETE /api/cotizaciones/:id
   */
  async eliminarCotizacion({ params, response }: HttpContext) {
    try {
      const cotizacion = await Cotizacion.findOrFail(params.id)

      // Si la cotización está aceptada, también eliminar el bloqueo del calendario
      if (cotizacion.estado === 'aceptada') {
        const { supabase } = await import('#services/supabase_service')
        await supabase
          .from('bloqueos_calendario')
          .delete()
          .eq('cotizacion_id', cotizacion.id)
      }

      await cotizacion.delete()

      return response.json({
        success: true,
        message: 'Cotización eliminada correctamente',
      })
    } catch (error) {
      console.error('Error eliminando cotización:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al eliminar la cotización',
        error: error instanceof Error ? error.message : 'desconocido',
      })
    }
  }
}
