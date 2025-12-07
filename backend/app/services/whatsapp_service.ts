import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  apiVersion: string
}

interface DocumentMessage {
  to: string
  documentUrl: string
  filename: string
  caption?: string
}

interface TemplateMessage {
  to: string
  templateName: string
  languageCode?: string
}

export default class WhatsAppService {
  private config: WhatsAppConfig

  constructor() {
    this.config = {
      phoneNumberId: env.get('WHATSAPP_PHONE_NUMBER_ID'),
      accessToken: env.get('WHATSAPP_ACCESS_TOKEN'),
      apiVersion: env.get('WHATSAPP_API_VERSION', 'v22.0'),
    }
  }

  /**
   * Sube un archivo (PDF) a WhatsApp y obtiene el media ID
   */
  async uploadMedia(fileBuffer: Buffer, mimeType: string = 'application/pdf'): Promise<string | null> {
    try {
      const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/media`

      // Usar node-fetch con form-data
      const FormData = (await import('form-data')).default
      const formData = new FormData()
      
      formData.append('file', fileBuffer, {
        filename: 'document.pdf',
        contentType: mimeType,
      })
      formData.append('messaging_product', 'whatsapp')

      // Hacer request con headers de form-data
      const headers = {
        Authorization: `Bearer ${this.config.accessToken}`,
        ...formData.getHeaders(),
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData as any,
      })

      const responseText = await response.text()
      logger.info({ status: response.status, body: responseText }, 'Respuesta de WhatsApp uploadMedia')

      let data
      try {
        data = JSON.parse(responseText)
      } catch {
        logger.error({ responseText }, 'Error parseando respuesta de WhatsApp')
        return null
      }

      if (!response.ok) {
        logger.error({ response: data }, 'Error subiendo media a WhatsApp')
        return null
      }

      logger.info({ mediaId: data.id }, 'Media subido a WhatsApp exitosamente')
      return data.id
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined }, 'Error en WhatsAppService.uploadMedia')
      return null
    }
  }

  /**
   * Envía un documento (PDF) por WhatsApp usando media ID
   */
  async sendDocumentByMediaId(to: string, mediaId: string, filename: string, caption?: string): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'document',
        document: {
          id: mediaId,
          filename: filename,
          caption: caption || '',
        },
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        logger.error({ response: data }, 'Error enviando documento por WhatsApp')
        return false
      }

      logger.info({ to, filename, messageId: data.messages?.[0]?.id }, 'Documento enviado por WhatsApp')
      return true
    } catch (error) {
      logger.error({ error }, 'Error en WhatsAppService.sendDocumentByMediaId')
      return false
    }
  }

  /**
   * Envía un documento (PDF) por WhatsApp usando URL
   */
  async sendDocument({ to, documentUrl, filename, caption }: DocumentMessage): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'document',
        document: {
          link: documentUrl,
          ...(filename && { filename: filename }),
          ...(caption && { caption: caption }),
        },
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        logger.error({ response: data }, 'Error enviando documento por WhatsApp')
        return false
      }

      // Verificar que el mensaje fue aceptado
      const messageStatus = data.messages?.[0]?.message_status
      const messageId = data.messages?.[0]?.id
      const hasContacts = data.contacts && data.contacts.length > 0
      const wasAccepted = (messageStatus === 'accepted' || messageId) && hasContacts

      if (!wasAccepted) {
        logger.warn({ response: data, to }, 'Documento enviado pero sin confirmación de WhatsApp')
        return false
      }

      logger.info({ to, filename, messageId, messageStatus, contacts: data.contacts }, '✅ Documento enviado y aceptado por WhatsApp')
      return true
    } catch (error) {
      logger.error({ error }, 'Error en WhatsAppService.sendDocument')
      return false
    }
  }

  /**
   * Envía un template (mensaje predefinido) por WhatsApp
   */
  async sendTemplate({ to, templateName, languageCode = 'es' }: TemplateMessage): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`

      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
        },
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        logger.error({ response: data }, 'Error enviando template por WhatsApp')
        return false
      }

      // Verificar que el mensaje fue aceptado
      const messageStatus = data.messages?.[0]?.message_status
      const messageId = data.messages?.[0]?.id
      const wasAccepted = messageStatus === 'accepted' || messageId

      if (!wasAccepted) {
        logger.warn({ response: data, to }, 'Template enviado pero sin confirmación de WhatsApp')
        return false
      }

      logger.info({ to, templateName, messageId, messageStatus, contacts: data.contacts }, 'Template enviado y aceptado por WhatsApp')
      return true
    } catch (error) {
      logger.error({ error }, 'Error en WhatsAppService.sendTemplate')
      return false
    }
  }

  /**
   * Envía la cotización al cliente y al gerente como documento directo (sin botón)
   */
  async enviarCotizacionConDocumento(
    telefonoCliente: string,
    telefonoGerente: string,
    pdfUrl: string,
    numeroCotizacion: string,
    detallesCotizacion: {
      salon: string
      fecha: string
      horaInicio: string
      horaFin: string
      valorTotal: number
      nombreCliente: string
      emailCliente?: string
    }
  ): Promise<{ cliente: boolean; gerente: boolean }> {
    const filename = `Cotizacion_${numeroCotizacion}.pdf`
    
    const whatsappGerenteUrl = `https://wa.me/${telefonoGerente}`
    
    const captionCliente = 
      `Reciban un cordial saludo de la *CORPORACIÓN CLUB EL META*.\n\n` +
      `Nos complace dar a conocer nuestro portafolio de servicios para la realización de su evento en nuestras instalaciones.\n\n` +
      `*Salón:* ${detallesCotizacion.salon}\n` +
      `*Fecha:* ${detallesCotizacion.fecha}\n` +
      `*Horario:* ${detallesCotizacion.horaInicio} - ${detallesCotizacion.horaFin}\n` +
      `*Valor Total:* $${detallesCotizacion.valorTotal.toLocaleString('es-CO')}\n\n` +
      `Adjunto encontrará el detalle completo de su cotización.\n\n` +
      `Nos comunicaremos con usted pronto para confirmar los detalles. Si tiene alguna consulta:\n` +
      `${whatsappGerenteUrl}`
    
    // Enviar documento al cliente (solo un mensaje)
    const clienteEnviado = await this.sendDocument({
      to: telefonoCliente,
      documentUrl: pdfUrl,
      filename: filename,
      caption: captionCliente,
    })

    // Para el gerente: mensaje con toda la información y datos de contacto del cliente
    let bodyGerente = 
      `Nueva cotización generada:\n\n` +
      `*Cliente:* ${detallesCotizacion.nombreCliente}\n` +
      `*Salón:* ${detallesCotizacion.salon}\n` +
      `*Fecha:* ${detallesCotizacion.fecha}\n` +
      `*Horario:* ${detallesCotizacion.horaInicio} - ${detallesCotizacion.horaFin}\n` +
      `*Valor:* $${detallesCotizacion.valorTotal.toLocaleString('es-CO')}\n\n`

    // Agregar datos de contacto del cliente
    const contactos: string[] = []
    if (telefonoCliente && telefonoCliente.length > 5) {
      const whatsappUrl = `https://wa.me/${telefonoCliente}`
      contactos.push(`WhatsApp: ${whatsappUrl}`)
    }
    if (detallesCotizacion.emailCliente) {
      contactos.push(`Email: ${detallesCotizacion.emailCliente}`)
    }

    if (contactos.length > 0) {
      bodyGerente += `*Contacto:*\n${contactos.join('\n')}\n\n`
    } else {
      bodyGerente += `⚠️ *Sin datos de contacto registrados*\n\n`
    }

    // Enviar documento PDF al gerente con toda la información
    const gerenteEnviado = await this.sendDocument({
      to: telefonoGerente,
      documentUrl: pdfUrl,
      filename: filename,
      caption: bodyGerente,
    })

    logger.info({ 
      cliente: clienteEnviado,
      gerente: gerenteEnviado
    }, '📱 Resultado envío cotización por WhatsApp')

    return {
      cliente: clienteEnviado,
      gerente: gerenteEnviado,
    }
  }

  /**
   * Envía la cotización al cliente y al gerente (método legacy con URL)
   */
  async enviarCotizacion(
    telefonoCliente: string,
    telefonoGerente: string,
    pdfUrl: string,
    numeroCotizacion: string
  ): Promise<{ cliente: boolean; gerente: boolean }> {
    const filename = `Cotizacion_${numeroCotizacion}.pdf`
    const captionCliente = `Hola! Aquí está tu cotización #${numeroCotizacion}. Cualquier duda, estamos para ayudarte.`
    const captionGerente = `Nueva cotización #${numeroCotizacion} generada y enviada al cliente.`

    const [clienteEnviado, gerenteEnviado] = await Promise.all([
      this.sendDocument({
        to: telefonoCliente,
        documentUrl: pdfUrl,
        filename: filename,
        caption: captionCliente,
      }),
      this.sendDocument({
        to: telefonoGerente,
        documentUrl: pdfUrl,
        filename: filename,
        caption: captionGerente,
      }),
    ])

    return {
      cliente: clienteEnviado,
      gerente: gerenteEnviado,
    }
  }

  /**
   * Formatea un número de teléfono al formato internacional (sin + ni espacios)
   * Ejemplo: +57 317 754 1315 -> 573177541315
   * Si el número no tiene código de país, agrega 57 (Colombia)
   */
  formatPhoneNumber(phone: string): string {
    // Remover caracteres no numéricos
    let cleaned = phone.replace(/[\s\-\+\(\)]/g, '')
    
    // Si no empieza con 57 y tiene 10 dígitos (número local colombiano), agregar 57
    if (!cleaned.startsWith('57') && cleaned.length === 10) {
      cleaned = '57' + cleaned
    }
    
    return cleaned
  }
}
