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
  cotizacionNumero: string
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

function extraerNumeroCotizacion(codigo?: string | null): string {
  if (!codigo) {
    return '—'
  }

  const partes = codigo.split('-')
  return partes.length > 1 ? partes[partes.length - 1] : codigo
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
  const numeroCotizacion = extraerNumeroCotizacion(datos.cotizacionNumero)
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
          subject: `Nueva cotización #${extraerNumeroCotizacion(datos.cotizacionNumero)} - ${datos.nombreCliente}`,
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

export const EmailService = {
  enviarCorreosCotizacion,
}
