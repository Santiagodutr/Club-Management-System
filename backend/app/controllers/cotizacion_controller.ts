import type { HttpContext } from '@adonisjs/core/http'
import Cotizacion from '#models/cotizacion'
import Espacio from '#models/espacio'
import { PDFService } from '#services/pdf_service'
import vine from '@vinejs/vine'

export default class CotizacionController {
  /**
   * Crear una nueva cotización
   */
  async store({ request, response }: HttpContext) {
    try {
      // Validación del request
      const schema = vine.object({
        salon: vine.string().trim().minLength(1),
        fecha: vine.string().trim().minLength(1),
        hora: vine.string().trim().minLength(1),
        duracion: vine.number().min(1),
        asistentes: vine.number().min(1),
        prestaciones: vine.array(vine.string()),
        requiereSillas: vine.boolean(),
        numeroSillas: vine.number().min(0),
        nombre: vine.string().trim().minLength(1),
        email: vine.string().email().trim(),
        telefono: vine.string().trim().optional(),
        observaciones: vine.string().trim().optional(),
      })

      const data = await vine.validate({ schema, data: request.all() })

      // Generar número de cotización (formato 0926, etc)
      const lastCotizacion = await Cotizacion.query().orderBy('id', 'desc').first()
      const nextNumber = lastCotizacion ? parseInt(lastCotizacion.cotizacionNumero) + 1 : 926
      const cotizacionNumero = nextNumber.toString().padStart(4, '0')

      // Calcular detalles y total
      const detalles = await this.calcularDetalles(data)
      const valorTotal = detalles.reduce((sum, item) => sum + item.total, 0)

      // Crear cotización
      const cotizacion = await Cotizacion.create({
        salon: data.salon,
        fecha: data.fecha,
        hora: data.hora,
        duracion: data.duracion,
        asistentes: data.asistentes,
        prestaciones: JSON.stringify(data.prestaciones),
        requiereSillas: data.requiereSillas,
        numeroSillas: data.numeroSillas,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono || null,
        observaciones: data.observaciones || null,
        cotizacionNumero,
        valorTotal,
        detalles: JSON.stringify(detalles),
      })

      return response.status(201).json({
        success: true,
        message: 'Cotización creada exitosamente',
        data: cotizacion,
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
   * Descargar cotización en PDF
   */
  async downloadPdf({ params, response }: HttpContext) {
    try {
      const cotizacion = await Cotizacion.findOrFail(params.id)

      const pdfBuffer = await PDFService.generarCotizacionPDF(cotizacion)

      response.header('Content-Type', 'application/pdf')
      response.header(
        'Content-Disposition',
        `attachment; filename="Cotizacion-${cotizacion.cotizacionNumero}.pdf"`
      )

      return response.send(pdfBuffer)
    } catch (error) {
      console.error('Error generando PDF:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al generar el PDF',
        error: error.message,
      })
    }
  }

  /**
   * Calcular detalles de la cotización con precios
   */
  private async calcularDetalles(data: any) {
    const detalles: Array<{
      servicio: string
      cantidad: number
      valorUnitario: number
      total: number
    }> = []

    // Obtener tarifa del espacio desde la base de datos
    const espacio = await Espacio.query()
      .where('nombre', data.salon.toUpperCase())
      .preload('configuraciones', (query) => {
        query.preload('tarifas', (tarifaQuery) => {
          tarifaQuery.where('tipoCliente', 'particular')
        })
      })
      .first()

    let precioBase = 1500000 // Precio por defecto

    if (espacio && espacio.configuraciones.length > 0) {
      const config = espacio.configuraciones[0]
      if (config.tarifas && config.tarifas.length > 0) {
        const tarifa = config.tarifas[0]
        // Usar precio según duración (4 horas o 8 horas)
        if (data.duracion <= 4 && tarifa.precio4Horas) {
          precioBase = parseFloat(tarifa.precio4Horas)
        } else if (tarifa.precio8Horas) {
          precioBase = parseFloat(tarifa.precio8Horas)
        }
      }
    }

    // Agregar salón
    detalles.push({
      servicio: `Alquiler de Salón ${data.salon}`,
      cantidad: 1,
      valorUnitario: precioBase,
      total: precioBase,
    })

    // Precios de prestaciones (ejemplo)
    const preciosPrestaciones: Record<string, number> = {
      Sillas: 50000,
      Mesas: 80000,
      Sonido: 100000,
      Iluminación: 60000,
      'Proyector / Pantalla': 100000,
      WiFi: 30000,
      Catering: 150000,
      'Personal de apoyo': 100000,
      Estacionamiento: 20000,
    }

    // Agregar prestaciones
    data.prestaciones.forEach((prestacion: string) => {
      const precio = preciosPrestaciones[prestacion] || 50000
      detalles.push({
        servicio: prestacion,
        cantidad: 1,
        valorUnitario: precio,
        total: precio,
      })
    })

    // Agregar sillas adicionales si las requiere
    if (data.requiereSillas && data.numeroSillas > 0) {
      const precioSilla = 5000
      detalles.push({
        servicio: 'Sillas adicionales',
        cantidad: data.numeroSillas,
        valorUnitario: precioSilla,
        total: precioSilla * data.numeroSillas,
      })
    }

    // Agregar cargo por número de horas si excede 4 horas
    if (data.duracion > 4 && data.duracion <= 8) {
      // Ya incluido en precio_8_horas, no agregar extra
    } else if (data.duracion > 8) {
      const horasAdicionales = data.duracion - 8
      const precioPorHora = 50000
      detalles.push({
        servicio: 'Horas adicionales',
        cantidad: horasAdicionales,
        valorUnitario: precioPorHora,
        total: precioPorHora * horasAdicionales,
      })
    }

    return detalles
  }
}
