import Cotizacion from '#models/cotizacion'
import Espacio from '#models/espacio'
import Disposicion from '#models/disposicion'
import DatosEmpresa from '#models/datos_empresa'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class PDFService {
  /**
   * Generar PDF desde HTML usando Puppeteer
   */
  static async generarPDF(cotizacion: Cotizacion): Promise<Buffer> {
    const htmlContent = await this.generarCotizacionHTML(cotizacion)

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })

      const page = await browser.newPage()
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        printBackground: true,
      })

      await browser.close()

      return Buffer.from(pdfBuffer)
    } catch (error) {
      console.error('Error generando PDF con Puppeteer:', error)
      throw new Error('Error al generar el PDF')
    }
  }

  /**
   * Generar HTML de cotización desde plantilla
   */
  static async generarCotizacionHTML(cotizacion: Cotizacion): Promise<string> {
    const variables = await this.prepararVariables(cotizacion)
    const css = this.cargarCSS()
    const plantilla = this.cargarPlantilla()
    const logoBase64 = this.cargarLogoPNG()

    return this.renderHTML(plantilla, css, logoBase64, variables)
  }

  /**
   * Preparar variables para la plantilla
   */
  private static async prepararVariables(cotizacion: Cotizacion): Promise<Record<string, any>> {
    const detalles = cotizacion.getDetalles()
    const fecha = new Date(cotizacion.fecha)
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

    const fechaFormato = `${fecha.getDate().toString().padStart(2, '0')} de ${meses[fecha.getMonth()].toUpperCase()} del ${fecha.getFullYear()}`
    const total = parseFloat(cotizacion.valorTotal.toString())
    const abono50 = Math.round(total * 0.5)

    // Obtener nombre del salón desde Espacio
    let nombreSalon = 'A definir'
    try {
      const espacio = await Espacio.find(cotizacion.espacioId)
      if (espacio) {
        nombreSalon = espacio.nombre
      }
    } catch (error) {
      console.warn('No se pudo obtener el nombre del salón:', error)
    }

    // Obtener configuración de disposición
    let configuracionDisposicion = 'A definir'
    try {
      const disposicion = await Disposicion.find(cotizacion.disposicionId)
      if (disposicion) {
        configuracionDisposicion = disposicion.nombre
      }
    } catch (error) {
      console.warn('No se pudo obtener la configuración de disposición:', error)
    }

    const servicios = detalles.map((d) => ({
      servicio: d.servicio,
      cantidad: d.cantidad,
      valorUnitario: this.formatearDinero(d.valorUnitario),
      total: this.formatearDinero(d.total),
    }))

    // Calcular hora de fin
    const horaInicio = cotizacion.hora.split(':')
    const horaInicioMinutos = parseInt(horaInicio[0]) * 60 + parseInt(horaInicio[1] || '0')
    const horaFinMinutos = horaInicioMinutos + cotizacion.duracion * 60
    const horaFinHoras = Math.floor(horaFinMinutos / 60) % 24
    const horaFinMins = horaFinMinutos % 60
    const horaFin = `${horaFinHoras.toString().padStart(2, '0')}:${horaFinMins.toString().padStart(2, '0')}`

    // Obtener datos bancarios desde la base de datos
    let datosBancarios = {
      bancolombiaCc: '(Consultar con administración)',
      daviviendaCc: '(Consultar con administración)',
      daviviendaCa: '(Consultar con administración)',
    }
    try {
      const datosEmpresa = await DatosEmpresa.findBy('key', 'empresa')
      if (datosEmpresa) {
        datosBancarios = {
          bancolombiaCc: datosEmpresa.bancolombiaCc || '(Consultar con administración)',
          daviviendaCc: datosEmpresa.daviviendaCc || '(Consultar con administración)',
          daviviendaCa: datosEmpresa.daviviendaCa || '(Consultar con administración)',
        }
      }
    } catch (error) {
      console.warn('No se pudieron obtener los datos bancarios:', error)
    }

    // Determinar etiqueta del tipo de cliente
    const tipoClienteLabel = cotizacion.tipoCliente === 'socio' ? 'Socio del Club' : 'Particular'

    return {
      numeroCotz: cotizacion.id.toString(),
      fecha: fechaFormato,
      cliente: {
        nombre: cotizacion.nombre,
        telefono: cotizacion.telefono || '___________________',
        email: cotizacion.email,
        tipoCliente: tipoClienteLabel,
      },
      evento: {
        fecha: fechaFormato,
        horaInicio: cotizacion.hora,
        horaFin: horaFin,
        duracion: cotizacion.duracion,
        asistentes: cotizacion.asistentes,
        salon: nombreSalon,
        disposicion: configuracionDisposicion,
      },
      servicios,
      totales: {
        total: this.formatearDinero(total),
        abono50: this.formatearDinero(abono50),
      },
      datosBancarios,
      observaciones: cotizacion.observaciones || 'Pendiente de detalles adicionales según requerimientos del cliente.',
    }
  }

  /**
   * Cargar CSS desde archivo externo
   */
  private static cargarCSS(): string {
    try {
      const cssPath = join(__dirname, '../resources/css/pdf_styles.css')
      return readFileSync(cssPath, 'utf-8')
    } catch (error) {
      console.warn('CSS no encontrado:', error)
      return ''
    }
  }

  /**
   * Cargar logo en base64
   */
  private static cargarLogoPNG(): string {
    try {
      const logoPath = join(__dirname, '../resources/images/logo_corpmeta.png')
      const buffer = readFileSync(logoPath)
      return buffer.toString('base64')
    } catch (error) {
      console.warn('Logo no encontrado:', error)
      return ''
    }
  }

  /**
   * Cargar plantilla HTML
   */
  private static cargarPlantilla(): string {
    try {
      const templatePath = join(__dirname, '../resources/templates/pdf_template.html')
      return readFileSync(templatePath, 'utf-8')
    } catch (error) {
      console.error('Plantilla no encontrada:', error)
      throw new Error('No se pudo cargar la plantilla PDF')
    }
  }

  /**
   * Renderizar HTML reemplazando variables en plantilla
   */
  private static renderHTML(plantilla: string, css: string, logoBase64: string, variables: Record<string, any>): string {
    let html = plantilla

    // Reemplazar CSS
    html = html.replace('{{CSS}}', css)

    // Reemplazar logo base64
    html = html.replace(/{{LOGO_BASE64}}/g, logoBase64)

    // Reemplazar variables principales
    html = html.replace('{{numeroCotz}}', variables.numeroCotz)
    html = html.replace('{{fecha}}', variables.fecha)

    // Reemplazar datos del cliente
    html = html.replace('{{cliente.nombre}}', variables.cliente.nombre)
    html = html.replace('{{cliente.telefono}}', variables.cliente.telefono)
    html = html.replace('{{cliente.email}}', variables.cliente.email)
    html = html.replace('{{cliente.tipoCliente}}', variables.cliente.tipoCliente)

    // Reemplazar datos del evento
    html = html.replace('{{evento.fecha}}', variables.evento.fecha)
    html = html.replace('{{evento.horaInicio}}', variables.evento.horaInicio)
    html = html.replace('{{evento.horaFin}}', variables.evento.horaFin)
    html = html.replace('{{evento.duracion}}', variables.evento.duracion)
    html = html.replace('{{evento.asistentes}}', variables.evento.asistentes)
    html = html.replace('{{evento.salon}}', variables.evento.salon)
    html = html.replace('{{evento.disposicion}}', variables.evento.disposicion)

    // Reemplazar servicios
    const filasServicios = variables.servicios
      .map(
        (s: any) => `
        <tr>
          <td>${s.servicio}</td>
          <td class="center">${s.cantidad}</td>
          <td class="right">${s.valorUnitario}</td>
          <td class="right">${s.total}</td>
        </tr>`
      )
      .join('')
    html = html.replace('{{servicios}}', filasServicios)

    // Reemplazar totales
    html = html.replace('{{totales.total}}', variables.totales.total)
    html = html.replace('{{totales.abono50}}', variables.totales.abono50)

    // Reemplazar datos bancarios
    html = html.replace('{{datosBancarios.bancolombiaCc}}', variables.datosBancarios.bancolombiaCc)
    html = html.replace('{{datosBancarios.daviviendaCc}}', variables.datosBancarios.daviviendaCc)
    html = html.replace('{{datosBancarios.daviviendaCa}}', variables.datosBancarios.daviviendaCa)

    // Reemplazar observaciones
    html = html.replace('{{observaciones}}', variables.observaciones)

    return html
  }

  /**
   * Formatear número como dinero COP
   */
  private static formatearDinero(valor: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor)
  }
}
