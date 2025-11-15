import PDFDocument from 'pdfkit'
import type Cotizacion from '#models/cotizacion'
import { DateTime } from 'luxon'

interface CotizacionItem {
  servicio: string
  cantidad: number
  valorUnitario: number
  total: number
}

export class PDFService {
  /**
   * Genera un PDF con el formato de cotización del Club El Meta
   */
  static async generarCotizacionPDF(cotizacion: Cotizacion): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        })

        const chunks: Buffer[] = []
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        // Header con logo (texto por ahora, puedes añadir imagen después)
        doc.fontSize(10).text('CORPORACION CLUB EL META', 50, 50, { align: 'center' })
        doc.fontSize(8).text('892.000.682-1', { align: 'center' })
        doc.moveDown(0.5)
        doc.fontSize(10).text(`Cot. ${cotizacion.cotizacionNumero}`, { align: 'center' })
        doc.fontSize(8).text(`Fecha: ${DateTime.now().toFormat('dd \'de\' MMMM \'del\' yyyy', { locale: 'es' })}`, {
          align: 'center',
        })
        doc.moveDown(2)

        // Señor
        doc.fontSize(10).text('Señor:', 50)
        doc.text(cotizacion.nombre)
        doc.moveDown(0.5)

        // Saludo
        doc.fontSize(9)
        doc.text('Apreciados señores,', 50)
        doc.text(
          'Reciban un cordial saludo de la CORPORACIÓN CLUB EL META, nos complace darle a conocer nuestro portafolio de servicios para la realización de su evento en nuestras instalaciones.'
        )
        doc.moveDown(1)

        // Detalles del evento
        doc.text(`Fecha: ${cotizacion.fecha}`)
        doc.text(`Hora: ${cotizacion.hora}`)
        doc.text(`N° de Personas: ${cotizacion.asistentes}`)
        doc.moveDown(1)

        // Tabla de servicios
        const detalles: CotizacionItem[] = JSON.parse(cotizacion.detalles)
        const tableTop = doc.y
        const colWidths = { servicio: 250, cantidad: 60, valor: 80, total: 80 }
        const tableLeft = 50

        // Header de tabla
        doc.fontSize(8).fillColor('#666')
        doc.rect(tableLeft, tableTop, 470, 20).fill('#E5E5E5')
        doc.fillColor('#000')
        doc.text('SERVICIO', tableLeft + 5, tableTop + 5)
        doc.text('CANTIDAD', tableLeft + colWidths.servicio + 5, tableTop + 5)
        doc.text('VALOR', tableLeft + colWidths.servicio + colWidths.cantidad + 5, tableTop + 5)
        doc.text('TOTAL', tableLeft + colWidths.servicio + colWidths.cantidad + colWidths.valor + 5, tableTop + 5)

        let currentY = tableTop + 25

        // Filas de servicios
        detalles.forEach((item) => {
          doc.fontSize(8)
          doc.text(item.servicio, tableLeft + 5, currentY, { width: colWidths.servicio - 10 })
          doc.text(item.cantidad.toString(), tableLeft + colWidths.servicio + 5, currentY)
          doc.text(
            `$${item.valorUnitario.toLocaleString('es-CO')}`,
            tableLeft + colWidths.servicio + colWidths.cantidad + 5,
            currentY
          )
          doc.text(
            `$${item.total.toLocaleString('es-CO')}`,
            tableLeft + colWidths.servicio + colWidths.cantidad + colWidths.valor + 5,
            currentY
          )

          // Línea separadora
          currentY += 20
          doc
            .moveTo(tableLeft, currentY)
            .lineTo(tableLeft + 470, currentY)
            .stroke('#DDD')
          currentY += 5
        })

        // Total
        doc.fontSize(9).fillColor('#000')
        doc.text('TOTAL COTIZACION', tableLeft + 5, currentY, { continued: true })
        doc.text(`$${cotizacion.valorTotal.toLocaleString('es-CO')}`, {
          align: 'right',
          width: 465,
        })
        currentY += 25

        // Notas
        doc.fontSize(8).moveDown(1)
        doc.text(
          'NOTA: Pendiente totalizar de acuerdo a las bebidas que requieran para el evento, las opciones de menú y la carta de bebidas ira como documento anexo a la cotización.',
          50,
          currentY + 20,
          { width: 500 }
        )
        doc.moveDown(0.5)
        doc.text('Estos precios incluyen el impuesto del IVA y del iconsumo.')
        doc.moveDown(0.5)
        doc.text('Pendiente consumos adicionales de bebidas.')
        doc.moveDown(0.5)
        doc.text('Nota: el encargado trae torta.')
        doc.moveDown(1)

        doc.fontSize(9).fillColor('#000')
        doc.text(
          'VIGENCIA: La presente propuesta tendrá vigencia de 5 días a partir de la fecha de expedición.',
          { width: 500 }
        )
        doc.moveDown(1)

        doc.fontSize(9).fillColor('#000').text('NOTA IMPORTANTE.', { underline: true })
        doc.fontSize(8).fillColor('#000')
        doc.text(
          'Para garantizar el evento se debe enviar confirmación por escrito donde se especifiquen los servicios reservados y realizar el anticipo del 50 % del valor de la cotización, 30 días antes y el saldo debe estar cancelado 48 horas antes del evento, los consumos y servicios adicionales deberán ser cancelados al finalizar el evento.',
          { width: 500 }
        )
        doc.moveDown(2)

        // Footer
        doc
          .fontSize(8)
          .text(
            'CORPORACION EL CLUB META CALLE 48 A CARRERA 30 BARRIO CAUDAL ORIENTAL',
            50,
            doc.page.height - 100,
            { align: 'center', width: 500 }
          )
        doc.text('VILLAVICENCIO -META', { align: 'center', width: 500 })

        doc.end()
      } catch (error) {
        reject(error)
      }
    })
  }
}
