import type { HttpContext } from '@adonisjs/core/http'
import Cotizacion from '#models/cotizacion'
import { PDFService } from '#services/pdf_service'
import { CotizacionService, type SolicitudCotizacion } from '#services/cotizacion_service'
import { EmailService, type DatosCotizacionEmail } from '#services/email_service'
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
   * Listar cotizaciones (admin: todas, usuario: propias)
   */
  async listarCotizaciones({ request, response }: HttpContext) {
    try {
      const { estado, email, fecha_desde, fecha_hasta } = request.qs()
      let query = Cotizacion.query()

      if (email) {
        query = query.where('email', email)
      }

      if (estado) {
        query = query.where('estado', estado)
      }

      if (fecha_desde) {
        query = query.whereRaw('DATE(fecha) >= ?', [fecha_desde])
      }

      if (fecha_hasta) {
        query = query.whereRaw('DATE(fecha) <= ?', [fecha_hasta])
      }

      const cotizaciones = await query.orderBy('created_at', 'desc').limit(100)

      return response.json({
        success: true,
        data: cotizaciones.map((c) => ({
          id: c.id,
          numero: c.cotizacionNumero,
          cliente: c.nombre,
          email: c.email,
          fecha_evento: c.fecha,
          tipo_evento: c.tipoEvento,
          asistentes: c.asistentes,
          total: c.valorTotal,
          estado: c.estadoLegible,
          estado_pago: c.estadoPagoLegible,
          creado: c.createdAt,
        })),
      })
    } catch (error) {
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
            abono_50_porciento: cotizacion.calcularMontoAbono(),
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
          telefono: data.telefono || cotizacion.telefono,
          observaciones: data.observaciones || cotizacion.observaciones,
        }

        const resultado = await CotizacionService.crearCotizacion(solicitud)
        
        // Actualizar cotización existente con nuevos valores
        cotizacion.merge({
          espacioId: solicitud.espacioId,
          configuracionEspacioId: solicitud.configuracionEspacioId,
          disposicionId: resultado.cotizacion.disposicionId,
          fecha: solicitud.fecha,
          hora: solicitud.horaInicio,
          duracion: solicitud.duracion,
          asistentes: solicitud.asistentes,
          tipoEvento: solicitud.tipoEvento,
          prestaciones: solicitud.servicios,
          valorTotal: resultado.cotizacion.valorTotal,
          detalles: resultado.detalles,
          horasAdicionalesAplicadas: resultado.cotizacion.horasAdicionalesAplicadas,
          recargoNocturnoAplicado: resultado.cotizacion.recargoNocturnoAplicado,
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

      const resultado = await EmailService.enviarCorreosCotizacion(datosEmail)

      return response.json({
        success: true,
        message: 'Correos enviados',
        data: resultado,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al enviar correos',
        error: error instanceof Error ? error.message : 'desconocido',
      })
    }
  }
}
