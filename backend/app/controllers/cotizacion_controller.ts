import type { HttpContext } from '@adonisjs/core/http'
import Cotizacion from '#models/cotizacion'
import { PDFService } from '#services/pdf_service'
import { CotizacionService, type SolicitudCotizacion } from '#services/cotizacion_service'
import { EmailService, type DatosCotizacionEmail } from '#services/email_service'
import vine from '@vinejs/vine'

export default class CotizacionController {
  /**
   * Obtener disponibilidad de fechas para un espacio
   */
  async obtenerDisponibilidad({ request, response }: HttpContext) {
    const query = request.qs()
    try {
      const { espacioId, fecha, duracion, tipoEvento } = query

      if (!espacioId || !fecha || !duracion || !tipoEvento) {
        return response.status(400).json({
          success: false,
          message: 'Faltan parámetros: espacioId, fecha, duracion, tipoEvento',
        })
      }

      const validacion = await CotizacionService.validarDisponibilidad(
        parseInt(espacioId),
        fecha,
        query.horaInicio || '08:00',
        parseInt(duracion),
        tipoEvento
      )

      return response.json({
        success: true,
        data: validacion,
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error al verificar disponibilidad',
        error: error.message,
      })
    }
  }

  /**
   * Crear una nueva cotización
   */
  async crearCotizacion({ request, response }: HttpContext) {
    try {
      const schema = vine.object({
        espacioId: vine.number(),
        configuracionEspacioId: vine.number(),
        fecha: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
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

      // Enviar correos de notificación (async, no bloqueante)
      const datosEmail: DatosCotizacionEmail = {
        cotizacionId: resultado.cotizacion.id,
        cotizacionNumero: resultado.cotizacion.cotizacionNumero,
        nombreCliente: resultado.cotizacion.nombre,
        emailCliente: resultado.cotizacion.email,
        telefonoCliente: resultado.cotizacion.telefono,
        salon: resultado.cotizacion.salon,
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
   * Confirmar cotización (cambiar estado a aceptada)
   */
  async confirmarCotizacion({ params, response }: HttpContext) {
    try {
      const cotizacion = await Cotizacion.findOrFail(params.id)

      if (cotizacion.estado === 'aceptada') {
        return response.status(400).json({
          success: false,
          message: 'La cotización ya ha sido confirmada',
        })
      }

      await CotizacionService.confirmarCotizacion(cotizacion.id)
      await cotizacion.refresh()

      return response.json({
        success: true,
        message: 'Cotización confirmada exitosamente',
        data: cotizacion,
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Error al confirmar la cotización',
        error: error.message,
      })
    }
  }

  /**
   * Registrar pago de cotización
   */
  async registrarPago({ params, request, response }: HttpContext) {
    try {
      const { monto, tipo_pago } = request.all()

      if (!monto || !tipo_pago) {
        return response.status(400).json({
          success: false,
          message: 'Faltan parámetros: monto, tipo_pago',
        })
      }

      const cotizacion = await Cotizacion.findOrFail(params.id)
      const montoPagado = parseFloat(monto)
      const totalPagado = (parseFloat(cotizacion.montoPagado.toString()) || 0) + montoPagado

      // Actualizar estado de pago
      cotizacion.montoPagado = totalPagado
      const total = parseFloat(cotizacion.valorTotal.toString())

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
          monto_pagado: cotizacion.montoPagado,
          estado_pago: cotizacion.estadoPagoLegible,
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
        `inline; filename="Cotizacion-${cotizacion.cotizacionNumero}.pdf"`
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
      const cotizacion = await Cotizacion.findOrFail(params.id)

      const datosEmail: DatosCotizacionEmail = {
        cotizacionId: cotizacion.id,
        cotizacionNumero: cotizacion.cotizacionNumero,
        nombreCliente: cotizacion.nombre,
        emailCliente: cotizacion.email,
        telefonoCliente: cotizacion.telefono,
        salon: cotizacion.salon,
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
