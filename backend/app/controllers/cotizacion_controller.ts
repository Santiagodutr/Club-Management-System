import type { HttpContext } from '@adonisjs/core/http'
import Cotizacion from '#models/cotizacion'
import { PDFService } from '#services/pdf_service'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'

export default class CotizacionController {
  /**
   * Obtener tarifas de un espacio
   */
  async obtenerTarifas({ params, response }: HttpContext) {
    try {
      const espacio = await db
        .from('espacios')
        .where('nombre', params.nombre.toUpperCase())
        .first()

      if (!espacio) {
        return response.status(404).json({
          success: false,
          message: 'Espacio no encontrado',
        })
      }

      const configuracion = await db
        .from('configuraciones_espacio')
        .where('espacio_id', espacio.id)
        .first()

      if (!configuracion) {
        return response.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
        })
      }

      const tarifa = await db
        .from('tarifas')
        .where('configuracion_espacio_id', configuracion.id)
        .where('tipo_cliente', 'particular')
        .first()

      return response.json({
        success: true,
        data: {
          espacio: espacio.nombre,
          capacidad: configuracion.capacidad,
          precio4Horas: tarifa?.precio_4_horas ? parseFloat(tarifa.precio_4_horas) : null,
          precio8Horas: tarifa?.precio_8_horas ? parseFloat(tarifa.precio_8_horas) : null,
        },
      })
    } catch (error) {
      console.error('Error obteniendo tarifas:', error)
      return response.status(500).json({
        success: false,
        message: 'Error al obtener tarifas',
        error: error.message,
      })
    }
  }

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

      console.log('Datos recibidos:', data)

      // Generar número de cotización (formato 0926, etc)
      const lastCotizacion = await Cotizacion.query().orderBy('id', 'desc').first()
      const nextNumber = lastCotizacion ? parseInt(lastCotizacion.cotizacionNumero) + 1 : 926
      const cotizacionNumero = nextNumber.toString().padStart(4, '0')

      console.log('Número de cotización:', cotizacionNumero)

      // Calcular detalles y total
      const detalles = await this.calcularDetalles(data)
      const valorTotal = detalles.reduce((sum, item) => sum + item.total, 0)

      console.log('Detalles calculados:', detalles)
      console.log('Valor total:', valorTotal)

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
    const espacio = await db
      .from('espacios')
      .where('nombre', data.salon.toUpperCase())
      .first()

    let precioBase = 1500000 // Precio por defecto

    if (espacio) {
      const configuracion = await db
        .from('configuraciones_espacio')
        .where('espacio_id', espacio.id)
        .first()

      if (configuracion) {
        const tarifa = await db
          .from('tarifas')
          .where('configuracion_espacio_id', configuracion.id)
          .where('tipo_cliente', 'particular')
          .first()

        if (tarifa) {
          // Usar precio según duración (4 horas o 8 horas)
          if (data.duracion <= 4 && tarifa.precio_4_horas) {
            precioBase = parseFloat(tarifa.precio_4_horas)
          } else if (tarifa.precio_8_horas) {
            precioBase = parseFloat(tarifa.precio_8_horas)
          }
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
