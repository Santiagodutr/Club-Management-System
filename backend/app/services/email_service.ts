import { Resend } from 'resend'
import env from '#start/env'
import DatosEmpresa from '#models/datos_empresa'
import { PDFService } from '#services/pdf_service'
import Cotizacion from '#models/cotizacion'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const resend = new Resend(env.get('RESEND_API_KEY'))
const FROM_EMAIL = env.get('RESEND_FROM_EMAIL', 'Club El Meta <noreply@clubelmeta.com>')
const BASE_URL = env.get('BACKEND_URL', env.get('FRONTEND_URL', 'http://localhost:3333'))

const COLORS = {
  primary: '#0a4ba5',
  primaryDark: '#083a82',
  white: '#ffffff',
  lightGray: '#f7f9fc',
  darkGray: '#1a1a2e',
  textGray: '#64748b',
  border: '#e2e8f0',
  whatsapp: '#25D366',
}

export interface DatosCotizacionEmail {
  cotizacionId: number
  nombreCliente: string
  emailCliente: string
  telefonoCliente?: string | null
  salon?: string | null
  fecha: string
  hora: string
  duracion: number
  asistentes: number
  tipoEvento?: string | null
  valorTotal?: number | null
  montoAbono?: number | null
  notas?: string | null
}

function formatearFechaLegible(fechaStr: string | Date | null | undefined): string {
  if (!fechaStr) {
    return 'Fecha por confirmar'
  }

  const fecha = typeof fechaStr === 'string' ? new Date(fechaStr) : fechaStr
  if (Number.isNaN(fecha?.getTime?.())) {
    return 'Fecha por confirmar'
  }

  return fecha.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatearHora24(horaStr: string | null | undefined): string {
  if (!horaStr) {
    return '--:--'
  }

  const partes = horaStr.split(':')
  if (partes.length >= 2) {
    const horas = partes[0]?.padStart(2, '0') ?? '00'
    const minutos = partes[1]?.padStart(2, '0') ?? '00'
    return `${horas}:${minutos}`
  }

  return horaStr
}

function construirPdfUrl(cotizacionId: number): string {
  const base = BASE_URL.replace(/\/$/, '')
  return `${base}/api/cotizaciones/${cotizacionId}/pdf`
}

function cargarLogoBuffer(): Buffer | null {
  try {
    const ruta = join(__dirname, '..', 'resources', 'images', 'logo_corpmeta.png')
    return readFileSync(ruta)
  } catch (error) {
    console.warn('No se pudo cargar el logo corporativo:', error)
    return null
  }
}

function construirAdjuntos(pdfBuffer?: Buffer | null, logoBuffer?: Buffer | null) {
  const adjuntos: {
    content: string | Buffer
    filename: string
    contentType?: string
    disposition?: 'attachment' | 'inline'
    contentId?: string
  }[] = []

  if (pdfBuffer) {
    adjuntos.push({
      content: pdfBuffer,
      filename: 'cotizacion-club-el-meta.pdf',
      contentType: 'application/pdf',
      disposition: 'attachment',
    })
  }

  if (logoBuffer) {
    adjuntos.push({
      content: logoBuffer,
      filename: 'logo-club-el-meta.png',
      contentType: 'image/png',
      disposition: 'inline',
      contentId: 'logo-corpmeta',
    })
  }

  return adjuntos
}

function generarEmailCliente(
  datos: DatosCotizacionEmail,
  whatsappGerente: string,
  mostrarLogo: boolean,
  pdfUrl: string
) {
  const fechaLegible = formatearFechaLegible(datos.fecha)
  const horaFormateada = formatearHora24(datos.hora)
  const salon = datos.salon || 'Por confirmar'
  const whatsappLimpio = whatsappGerente?.replace(/\D/g, '')
  const whatsappLink = whatsappLimpio ? `https://wa.me/${whatsappLimpio}?text=${encodeURIComponent('Hola, solicité una cotización y me gustaría más información.')}` : null

  const botonWhatsappEstado = whatsappLink ? '' : ' opacity:0.6; pointer-events:none;'

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización lista</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI',Roboto,sans-serif; background:${COLORS.lightGray};">
  <table role="presentation" style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="padding:32px 0;">
        <table role="presentation" style="width:100%; max-width:720px; margin:0 auto; background:${COLORS.white}; border-radius:20px; overflow:hidden; box-shadow:0 18px 40px rgba(3,27,77,0.12);">
          <tr>
            <td style="background:linear-gradient(120deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); padding:36px 48px;">
              <table role="presentation" style="width:100%;">
                <tr>
                  <td>
                    ${mostrarLogo ? `<img src="cid:logo-corpmeta" alt="Club El Meta" style="width:80px; height:auto;" />` : ''}
                  </td>
                  <td style="text-align:right;">
                    <div style="color:${COLORS.white}; font-size:13px; letter-spacing:2px; text-transform:uppercase; opacity:0.85;">Corporación Club El Meta</div>
                    <div style="color:${COLORS.white}; font-size:12px; opacity:0.65; margin-top:6px;">NIT 892.000.682-1</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 48px 18px 48px;">
              <h1 style="margin:0; color:${COLORS.darkGray}; font-size:26px; letter-spacing:-0.5px;">Hola ${datos.nombreCliente}</h1>
              <p style="margin:10px 0 0 0; color:${COLORS.textGray}; font-size:15px; line-height:1.7;">Aquí tienes el resumen de tu evento tal como lo registramos.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 28px 48px;">
              <div style="color:${COLORS.darkGray}; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Tu información de contacto</div>
              <div style="margin-top:10px; padding:18px 20px; background:${COLORS.lightGray}; border-radius:16px; border:1px solid ${COLORS.border};">
                <p style="margin:0 0 8px 0; color:${COLORS.darkGray}; font-size:14px;"><strong style="color:${COLORS.primary};">Nombre:</strong> ${datos.nombreCliente}</p>
                <p style="margin:0 0 8px 0; color:${COLORS.darkGray}; font-size:14px;"><strong style="color:${COLORS.primary};">Correo:</strong> ${datos.emailCliente}</p>
                <p style="margin:0; color:${COLORS.darkGray}; font-size:14px;"><strong style="color:${COLORS.primary};">Número:</strong> ${datos.telefonoCliente || 'No registrado'}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 32px 48px;">
              <table role="presentation" style="width:100%; border-collapse:collapse;">
                ${[
                  ['Salón', salon],
                  ['Fecha', fechaLegible],
                  ['Hora', horaFormateada],
                  ['Duración', `${datos.duracion} horas`],
                  ['Asistentes', `${datos.asistentes}`],
                ]
                  .map(
                    ([label, value]) => `
                <tr>
                  <td style="padding:10px 0; border-bottom:1px solid ${COLORS.border}; color:${COLORS.darkGray}; font-size:15px;">${label}</td>
                  <td style="padding:10px 0; border-bottom:1px solid ${COLORS.border}; text-align:right; color:${COLORS.textGray}; font-size:15px;">${value}</td>
                </tr>`
                  )
                  .join('')}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 44px 48px;">
              <table role="presentation" style="width:100%; border-collapse:collapse;">
                <tr>
                  <td style="padding:6px 8px; width:50%;">
                    <a href="${whatsappLink ?? '#'}" style="display:block; background:${COLORS.whatsapp}; color:${COLORS.white}; text-decoration:none; padding:16px; border-radius:14px; font-size:15px; font-weight:600; text-align:center;${botonWhatsappEstado}">
                      Contactar por WhatsApp
                    </a>
                  </td>
                  <td style="padding:6px 8px; width:50%;">
                    <a href="${pdfUrl}" style="display:block; background:${COLORS.primary}; color:${COLORS.white}; text-decoration:none; padding:16px; border-radius:14px; font-size:15px; font-weight:600; text-align:center;">
                      Descargar PDF
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:${COLORS.darkGray}; padding:24px 48px; text-align:center;">
              <p style="margin:0; color:rgba(255,255,255,0.85); font-size:12px; line-height:1.6;">CORPORACIÓN CLUB EL META · Calle 48A #30 · Barrio Caudal Oriental · Villavicencio, Meta</p>
            </td>
          </tr>
        </table>
        <p style="text-align:center; color:#8aa0c2; font-size:11px; margin:18px 0 0 0;">Este mensaje fue generado automáticamente.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

function generarEmailGerente(
  datos: DatosCotizacionEmail,
  mostrarLogo: boolean,
  pdfUrl: string
) {
  const numeroCotizacion = datos.cotizacionId.toString()
  const fechaLegible = formatearFechaLegible(datos.fecha)
  const horaFormateada = formatearHora24(datos.hora)
  const salon = datos.salon || 'Por confirmar'
  const whatsappCliente = datos.telefonoCliente?.replace(/\D/g, '')
  const whatsappLink = whatsappCliente
    ? `https://wa.me/${whatsappCliente}?text=${encodeURIComponent(
        `Hola ${datos.nombreCliente}, gracias por solicitar la cotización #${numeroCotizacion} en Club El Meta.`
      )}`
    : null

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Cotización #${numeroCotizacion}</title>
</head>
<body style="margin:0; padding:0; font-family:'Segoe UI',Roboto,sans-serif; background:${COLORS.lightGray};">
  <table role="presentation" style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="padding:32px 0;">
        <table role="presentation" style="width:100%; max-width:720px; margin:0 auto; background:${COLORS.white}; border-radius:20px; overflow:hidden; box-shadow:0 15px 40px rgba(3,27,77,0.1);">
          <tr>
            <td style="background:linear-gradient(120deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); padding:36px 48px;">
              <table role="presentation" style="width:100%;">
                <tr>
                  <td>
                    ${mostrarLogo ? `<img src="cid:logo-corpmeta" alt="Club El Meta" style="width:80px; height:auto;" />` : ''}
                  </td>
                  <td style="text-align:right;">
                    <div style="color:${COLORS.white}; font-size:13px; letter-spacing:2px; text-transform:uppercase; opacity:0.8;">Corporación Club El Meta</div>
                    <div style="color:${COLORS.white}; font-size:12px; opacity:0.7; margin-top:6px;">NIT 892.000.682-1</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 48px 12px 48px;">
              <h2 style="margin:0; color:${COLORS.darkGray}; font-size:22px;">Cotización #${numeroCotizacion}</h2>
              <p style="margin:8px 0 0 0; color:${COLORS.textGray}; font-size:14px;">Nueva solicitud registrada.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 8px 48px;">
              <div style="color:${COLORS.darkGray}; font-size:14px; margin-bottom:8px;">Información del cliente</div>
              <div style="padding:18px 20px; border:1px solid ${COLORS.border}; border-radius:16px; background:${COLORS.lightGray};">
                <p style="margin:0 0 8px 0; color:${COLORS.darkGray}; font-size:14px;"><strong style="color:${COLORS.primary};">Nombre:</strong> ${datos.nombreCliente}</p>
                <p style="margin:0 0 8px 0; font-size:14px;">
                  <strong style="color:${COLORS.primary};">Correo:</strong>
                  <a href="mailto:${datos.emailCliente}" style="color:${COLORS.darkGray}; text-decoration:none;">${datos.emailCliente}</a>
                </p>
                <p style="margin:0; color:${COLORS.darkGray}; font-size:14px;"><strong style="color:${COLORS.primary};">Número:</strong> ${datos.telefonoCliente || 'No registrado'}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 48px 32px 48px;">
              <div style="color:${COLORS.textGray}; font-size:14px;">Notas u observaciones</div>
              <div style="margin-top:8px; padding:16px; background:${COLORS.lightGray}; border-radius:16px; border:1px solid ${COLORS.border}; color:${COLORS.darkGray}; font-size:14px; line-height:1.6;">
                ${datos.notas || 'Sin notas adicionales'}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 20px 48px;">
              <div style="color:${COLORS.darkGray}; font-size:14px; margin-bottom:8px;">Detalles del evento</div>
              <table role="presentation" style="width:100%; border-collapse:collapse;">
                ${[
                  ['Salón', salon],
                  ['Fecha', fechaLegible],
                  ['Hora', horaFormateada],
                  ['Duración', `${datos.duracion} horas`],
                  ['Asistentes', `${datos.asistentes}`],
                  ['Tipo de evento', datos.tipoEvento || 'No especificado'],
                ]
                  .map(
                    ([label, value]) => `
                <tr>
                  <td style="padding:10px 0; border-bottom:1px solid ${COLORS.border}; color:${COLORS.textGray};">${label}</td>
                  <td style="padding:10px 0; border-bottom:1px solid ${COLORS.border}; text-align:right; color:${COLORS.primary}; font-weight:600;">${value}</td>
                </tr>`
                  )
                  .join('')}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 48px 44px 48px;">
              <table role="presentation" style="width:100%; border-collapse:collapse;">
                <tr>
                  ${whatsappLink ? `
                  <td style="padding:6px 8px; width:50%;">
                    <a href="${whatsappLink}" style="display:block; background:${COLORS.whatsapp}; color:${COLORS.white}; text-decoration:none; padding:14px 16px; text-align:center; border-radius:12px; font-size:14px; font-weight:600;">WhatsApp Cliente</a>
                  </td>` : ''}
                  <td style="padding:6px 8px; ${whatsappLink ? 'width:50%;' : 'width:100%;'}">
                    <a href="${pdfUrl}" style="display:block; background:${COLORS.primary}; color:${COLORS.white}; text-decoration:none; padding:14px 16px; text-align:center; border-radius:12px; font-size:14px; font-weight:600;">Abrir PDF</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:${COLORS.darkGray}; padding:24px 48px; text-align:center;">
              <p style="margin:0; color:rgba(255,255,255,0.75); font-size:11px; letter-spacing:0.5px;">CORPORACIÓN CLUB EL META · Calle 48A #30 · Barrio Caudal Oriental · Villavicencio, Meta</p>
            </td>
          </tr>
        </table>
        <p style="text-align:center; color:#8aa0c2; font-size:11px; margin:18px 0 0 0;">Este mensaje fue generado automáticamente.</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

async function enviarCorreosCotizacion(datos: DatosCotizacionEmail) {
  let clienteEnviado = false
  let gerenteEnviado = false
  const errores: string[] = []

  try {
    const datosEmpresa = await DatosEmpresa.first()
    const emailGerente = datosEmpresa?.emailGerente || env.get('GERENTE_EMAIL') || null
    const whatsappGerente = datosEmpresa?.whatsappGerente || env.get('GERENTE_WHATSAPP', '')
    const pdfUrl = construirPdfUrl(datos.cotizacionId)
    const logoBuffer = cargarLogoBuffer()

    let pdfBuffer: Buffer | null = null
    try {
      const cotizacion = await Cotizacion.findOrFail(datos.cotizacionId)
      pdfBuffer = await PDFService.generarPDF(cotizacion)
    } catch (error: any) {
      errores.push(`Error generando PDF: ${error.message}`)
      console.error('Error generando PDF:', error)
    }

    // Cliente
    try {
      const htmlCliente = generarEmailCliente(datos, whatsappGerente || '', Boolean(logoBuffer), pdfUrl)
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [datos.emailCliente],
        subject: 'Tu cotización está lista - Corporación Club El Meta',
        html: htmlCliente,
        attachments: construirAdjuntos(pdfBuffer, logoBuffer),
      })
      clienteEnviado = true
    } catch (error: any) {
      errores.push(`Error enviando al cliente: ${error.message}`)
      console.error('Error enviando correo al cliente:', error)
    }

    // Gerencia
    if (emailGerente) {
      try {
        const htmlGerente = generarEmailGerente(datos, Boolean(logoBuffer), pdfUrl)
        await resend.emails.send({
          from: FROM_EMAIL,
          to: [emailGerente],
          subject: `Nueva cotización #${datos.cotizacionId} - ${datos.nombreCliente}`,
          html: htmlGerente,
          attachments: construirAdjuntos(pdfBuffer, logoBuffer),
        })
        gerenteEnviado = true
      } catch (error: any) {
        errores.push(`Error enviando al gerente: ${error.message}`)
        console.error('Error enviando correo al gerente:', error)
      }
    } else {
      errores.push('Email del gerente no configurado en datos_empresa')
    }
  } catch (error: any) {
    errores.push(`Error general del servicio: ${error.message}`)
    console.error('Error general en EmailService:', error)
  }

  return { clienteEnviado, gerenteEnviado, errores }
}

/**
 * Enviar notificación de confirmación de reserva al cliente
 */
async function enviarNotificacionConfirmacion(datos: {
  nombreCliente: string
  emailCliente: string
  cotizacionId: number
  salon: string
  fecha: string
  hora: string
  duracion: number
  valorTotal: number
  montoPagado: number
  estadoPago: string
}): Promise<boolean> {
  try {
    const fechaLegible = formatearFechaLegible(datos.fecha)
    const valorFormateado = formatearPrecio(datos.valorTotal)
    const montoFormateado = formatearPrecio(datos.montoPagado)
    const saldoPendiente = datos.valorTotal - datos.montoPagado
    const saldoFormateado = formatearPrecio(saldoPendiente)

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reserva Confirmada</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${COLORS.lightGray};">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: ${COLORS.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%); padding: 40px 30px; text-align: center;">
                    <img src="cid:logo-corpmeta" alt="Club El Meta" style="width: 80px; height: auto; margin-bottom: 20px;" />
                    <h1 style="margin: 0; color: ${COLORS.white}; font-size: 28px; font-weight: 700;">
                      ✅ ¡Reserva Confirmada!
                    </h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Su cotización ha sido aceptada
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: ${COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
                      Estimado/a <strong>${datos.nombreCliente}</strong>,
                    </p>
                    <p style="margin: 0 0 30px 0; color: ${COLORS.textGray}; font-size: 15px; line-height: 1.6;">
                      Nos complace informarle que su cotización <strong>#${datos.cotizacionId}</strong> ha sido <strong>confirmada como reserva</strong>.
                    </p>

                    <!-- Info Card -->
                    <div style="background-color: ${COLORS.lightGray}; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid ${COLORS.primary};">
                      <h3 style="margin: 0 0 16px 0; color: ${COLORS.primary}; font-size: 18px; font-weight: 600;">
                        📋 Detalles de la Reserva
                      </h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">🏛️ Salón:</td>
                          <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${datos.salon}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">📅 Fecha:</td>
                          <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${fechaLegible}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">🕐 Hora:</td>
                          <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${datos.hora}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">⏱️ Duración:</td>
                          <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${datos.duracion} horas</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Payment Info -->
                    <div style="background-color: #f0fdf4; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #22c55e;">
                      <h3 style="margin: 0 0 16px 0; color: #16a34a; font-size: 18px; font-weight: 600;">
                        💳 Estado de Pago
                      </h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">Valor Total:</td>
                          <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${valorFormateado}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">Monto Pagado:</td>
                          <td style="padding: 8px 0; color: #16a34a; font-size: 14px; font-weight: 600; text-align: right;">${montoFormateado}</td>
                        </tr>
                        ${saldoPendiente > 0 ? `
                        <tr style="border-top: 1px solid #e5e7eb;">
                          <td style="padding: 12px 0 0 0; color: ${COLORS.darkGray}; font-size: 15px; font-weight: 600;">Saldo Pendiente:</td>
                          <td style="padding: 12px 0 0 0; color: #f59e0b; font-size: 16px; font-weight: 700; text-align: right;">${saldoFormateado}</td>
                        </tr>
                        ` : `
                        <tr style="border-top: 1px solid #e5e7eb;">
                          <td colspan="2" style="padding: 12px 0 0 0; color: #16a34a; font-size: 14px; font-weight: 600; text-align: center;">✅ Pagado Completamente</td>
                        </tr>
                        `}
                      </table>
                    </div>

                    ${saldoPendiente > 0 ? `
                    <div style="background-color: #fffbeb; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        ⚠️ <strong>Recordatorio:</strong> Le queda un saldo pendiente de <strong>${saldoFormateado}</strong> que debe cancelar antes del día del evento.
                      </p>
                    </div>
                    ` : ''}

                    <p style="margin: 0 0 20px 0; color: ${COLORS.textGray}; font-size: 15px; line-height: 1.6;">
                      Su fecha y hora han sido <strong>bloqueadas en nuestro calendario</strong>. Puede estar tranquilo/a, su evento está confirmado.
                    </p>

                    <p style="margin: 0; color: ${COLORS.textGray}; font-size: 15px; line-height: 1.6;">
                      Si tiene alguna pregunta, no dude en contactarnos.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: ${COLORS.lightGray}; padding: 30px; text-align: center; border-top: 1px solid ${COLORS.border};">
                    <p style="margin: 0 0 10px 0; color: ${COLORS.textGray}; font-size: 13px;">
                      Club El Meta - Salones de Eventos
                    </p>
                    <p style="margin: 0; color: ${COLORS.textGray}; font-size: 12px;">
                      Este correo fue generado automáticamente. No responder.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const logoBuffer = cargarLogoBuffer()
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [datos.emailCliente],
      subject: `✅ Reserva Confirmada #${datos.cotizacionId} - ${datos.salon}`,
      html,
      attachments: logoBuffer ? [{
        content: logoBuffer,
        filename: 'logo-club-el-meta.png',
        contentType: 'image/png',
        disposition: 'inline',
        contentId: 'logo-corpmeta',
      }] : undefined,
    })

    return true
  } catch (error: any) {
    console.error('Error enviando notificación de confirmación:', error)
    return false
  }
}

/**
 * Enviar notificación de cancelación al cliente
 */
async function enviarNotificacionCancelacion(datos: {
  nombreCliente: string
  emailCliente: string
  cotizacionId: number
  salon: string
  fecha: string
  hora: string
  motivo: string
  tipoRechazo: 'manual' | 'automatico'
}): Promise<boolean> {
  try {
    const fechaLegible = formatearFechaLegible(datos.fecha)
    const esAutomatico = datos.tipoRechazo === 'automatico'
    const logoBuffer = cargarLogoBuffer()

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cotización ${esAutomatico ? 'Cancelada' : 'Rechazada'}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${COLORS.lightGray};">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: ${COLORS.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
                    <img src="cid:logo-corpmeta" alt="Club El Meta" style="width: 80px; height: auto; margin-bottom: 20px;" />
                    <h1 style="margin: 0; color: ${COLORS.white}; font-size: 28px; font-weight: 700;">
                      ❌ Cotización ${esAutomatico ? 'Cancelada' : 'Rechazada'}
                    </h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                      Cotización #${datos.cotizacionId}
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px 0; color: ${COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
                      Estimado/a <strong>${datos.nombreCliente}</strong>,
                    </p>
                    <p style="margin: 0 0 30px 0; color: ${COLORS.textGray}; font-size: 15px; line-height: 1.6;">
                      ${esAutomatico 
                        ? 'Lamentablemente, su cotización ha sido <strong>cancelada automáticamente</strong> debido a que otra reserva fue confirmada en el mismo horario.'
                        : 'Lamentamos informarle que su cotización ha sido <strong>rechazada</strong>.'
                      }
                    </p>

                    <!-- Info Card -->
                    <div style="background-color: ${COLORS.lightGray}; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #dc2626;">
                      <h3 style="margin: 0 0 16px 0; color: #dc2626; font-size: 18px; font-weight: 600;">
                        📋 Detalles de la Cotización
                      </h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">🏛️ Salón:</td>
                          <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${datos.salon}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">📅 Fecha:</td>
                          <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${fechaLegible}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">🕐 Hora:</td>
                          <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${datos.hora}</td>
                        </tr>
                      </table>
                    </div>

                    <!-- Reason -->
                    <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #dc2626;">
                      <h3 style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px; font-weight: 600;">
                        ${esAutomatico ? '🔄 Razón' : '📝 Motivo'}
                      </h3>
                      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                        ${datos.motivo}
                      </p>
                    </div>

                    <p style="margin: 0 0 20px 0; color: ${COLORS.textGray}; font-size: 15px; line-height: 1.6;">
                      ${esAutomatico
                        ? 'Le invitamos a realizar una nueva cotización para una fecha diferente u horario alternativo.'
                        : 'Si desea más información o explorar otras opciones, no dude en contactarnos.'
                      }
                    </p>

                    <p style="margin: 0; color: ${COLORS.textGray}; font-size: 15px; line-height: 1.6;">
                      Agradecemos su interés en nuestros servicios.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: ${COLORS.lightGray}; padding: 30px; text-align: center; border-top: 1px solid ${COLORS.border};">
                    <p style="margin: 0 0 10px 0; color: ${COLORS.textGray}; font-size: 13px;">
                      Club El Meta - Salones de Eventos
                    </p>
                    <p style="margin: 0; color: ${COLORS.textGray}; font-size: 12px;">
                      Este correo fue generado automáticamente. No responder.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [datos.emailCliente],
      subject: `${esAutomatico ? '❌ Cotización Cancelada' : '❌ Cotización Rechazada'} #${datos.cotizacionId}`,
      html,
      attachments: logoBuffer ? [{
        content: logoBuffer,
        filename: 'logo-club-el-meta.png',
        contentType: 'image/png',
        disposition: 'inline',
        contentId: 'logo-corpmeta',
      }] : undefined,
    })

    return true
  } catch (error: any) {
    console.error('Error enviando notificación de cancelación:', error)
    return false
  }
}

/**
 * Enviar notificaciones de cancelación en batch (hasta 100 emails)
 */
async function enviarNotificacionesCancelacionBatch(
  cotizaciones: Array<{
    nombreCliente: string
    emailCliente: string
    cotizacionId: number
    salon: string
    fecha: string
    hora: string
    motivo: string
    tipoRechazo: 'manual' | 'automatico'
  }>
): Promise<{ success: number; failed: number }> {
  try {
    if (cotizaciones.length === 0) {
      return { success: 0, failed: 0 }
    }

    // Resend permite hasta 100 emails por batch
    const batchSize = 100
    let totalSuccess = 0
    let totalFailed = 0
    const logoBuffer = cargarLogoBuffer()

    for (let i = 0; i < cotizaciones.length; i += batchSize) {
      const batch = cotizaciones.slice(i, i + batchSize)

      const emails = batch.map((datos) => {
        const fechaLegible = formatearFechaLegible(datos.fecha)
        const esAutomatico = datos.tipoRechazo === 'automatico'

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cotización ${esAutomatico ? 'Cancelada' : 'Rechazada'}</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${COLORS.lightGray};">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: ${COLORS.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <tr>
                      <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
                        <img src="cid:logo-corpmeta" alt="Club El Meta" style="width: 80px; height: auto; margin-bottom: 20px;" />
                        <h1 style="margin: 0; color: ${COLORS.white}; font-size: 28px; font-weight: 700;">
                          ❌ Cotización ${esAutomatico ? 'Cancelada' : 'Rechazada'}
                        </h1>
                        <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                          Cotización #${datos.cotizacionId}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: ${COLORS.darkGray}; font-size: 16px; line-height: 1.6;">
                          Estimado/a <strong>${datos.nombreCliente}</strong>,
                        </p>
                        <p style="margin: 0 0 30px 0; color: ${COLORS.textGray}; font-size: 15px; line-height: 1.6;">
                          ${
                            esAutomatico
                              ? 'Lamentablemente, su cotización ha sido <strong>cancelada automáticamente</strong> debido a que otra reserva fue confirmada en el mismo horario.'
                              : 'Lamentamos informarle que su cotización ha sido <strong>rechazada</strong>.'
                          }
                        </p>
                        <div style="background-color: ${COLORS.lightGray}; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #dc2626;">
                          <h3 style="margin: 0 0 16px 0; color: #dc2626; font-size: 18px; font-weight: 600;">
                            📋 Detalles de la Cotización
                          </h3>
                          <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">🏛️ Salón:</td>
                              <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${datos.salon}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">📅 Fecha:</td>
                              <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${fechaLegible}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: ${COLORS.textGray}; font-size: 14px;">🕐 Hora:</td>
                              <td style="padding: 8px 0; color: ${COLORS.darkGray}; font-size: 14px; font-weight: 600; text-align: right;">${datos.hora}</td>
                            </tr>
                          </table>
                        </div>
                        <div style="background-color: #fef2f2; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #dc2626;">
                          <h3 style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px; font-weight: 600;">
                            ${esAutomatico ? '🔄 Razón' : '📝 Motivo'}
                          </h3>
                          <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                            ${datos.motivo}
                          </p>
                        </div>
                        <p style="margin: 0 0 20px 0; color: ${COLORS.textGray}; font-size: 15px; line-height: 1.6;">
                          ${
                            esAutomatico
                              ? 'Le invitamos a realizar una nueva cotización para una fecha diferente u horario alternativo.'
                              : 'Si desea más información o explorar otras opciones, no dude en contactarnos.'
                          }
                        </p>
                        <p style="margin: 0; color: ${COLORS.textGray}; font-size: 15px; line-height: 1.6;">
                          Agradecemos su interés en nuestros servicios.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color: ${COLORS.lightGray}; padding: 30px; text-align: center; border-top: 1px solid ${COLORS.border};">
                        <p style="margin: 0 0 10px 0; color: ${COLORS.textGray}; font-size: 13px;">
                          Club El Meta - Salones de Eventos
                        </p>
                        <p style="margin: 0; color: ${COLORS.textGray}; font-size: 12px;">
                          Este correo fue generado automáticamente. No responder.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `

        return {
          from: FROM_EMAIL,
          to: [datos.emailCliente],
          subject: `${esAutomatico ? '❌ Cotización Cancelada' : '❌ Cotización Rechazada'} #${datos.cotizacionId}`,
          html,
          attachments: logoBuffer ? [{
            content: logoBuffer,
            filename: 'logo-club-el-meta.png',
            contentType: 'image/png',
            disposition: 'inline',
            contentId: 'logo-corpmeta',
          }] : undefined,
        }
      })

      try {
        await resend.batch.send(emails)
        totalSuccess += emails.length
      } catch (error: any) {
        console.error(`Error enviando batch de ${emails.length} emails:`, error)
        totalFailed += emails.length
      }
    }

    return { success: totalSuccess, failed: totalFailed }
  } catch (error: any) {
    console.error('Error en enviarNotificacionesCancelacionBatch:', error)
    return { success: 0, failed: cotizaciones.length }
  }
}

export const EmailService = {
  enviarCorreosCotizacion,
  enviarNotificacionConfirmacion,
  enviarNotificacionCancelacion,
  enviarNotificacionesCancelacionBatch,
}
