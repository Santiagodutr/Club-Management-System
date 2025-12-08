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

interface WhatsAppResponse {
  messaging_product?: string
  contacts?: Array<{ input: string; wa_id: string }>
  messages?: Array<{ id: string; message_status?: string }>
  error?: {
    message: string
    type: string
    code: number
    error_data?: {
      details: string
    }
  }
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
      // Crear FormData con form-data de Node.js
      const FormData = (await import('form-data')).default
      const formData = new FormData()
      
      // Primero agregar messaging_product
      formData.append('messaging_product', 'whatsapp')
      
      // Luego agregar el archivo con sus opciones
      formData.append('file', fileBuffer, {
        filename: 'document.pdf',
        contentType: mimeType,
      })

      // Importante: usar el tipo correcto para el archivo
      formData.append('type', mimeType)

      // Hacer request usando el método submit de form-data (recomendado para Node.js)
      return new Promise((resolve, reject) => {
        formData.submit(
          {
            protocol: 'https:',
            host: 'graph.facebook.com',
            path: `/${this.config.apiVersion}/${this.config.phoneNumberId}/media`,
            headers: {
              Authorization: `Bearer ${this.config.accessToken}`,
            },
          },
          (err, res) => {
            if (err) {
              logger.error({ error: err.message }, 'Error en request de upload media')
              reject(err)
              return
            }

            let responseText = ''
            res.on('data', (chunk) => {
              responseText += chunk.toString()
            })

            res.on('end', () => {
              logger.info({ status: res.statusCode, body: responseText }, 'Respuesta de WhatsApp uploadMedia')

              try {
                const data = JSON.parse(responseText)

                if (res.statusCode !== 200) {
                  logger.error({ response: data }, 'Error subiendo media a WhatsApp')
                  resolve(null)
                  return
                }

                logger.info({ mediaId: data.id }, '✅ Media subido a WhatsApp exitosamente')
                resolve(data.id)
              } catch (parseError) {
                logger.error({ responseText }, 'Error parseando respuesta de WhatsApp')
                resolve(null)
              }
            })

            res.on('error', (error) => {
              logger.error({ error: error.message }, 'Error en response de upload media')
              resolve(null)
            })
          }
        )
      })
    } catch (error) {
      logger.error({ 
        error: error instanceof Error ? error.message : error, 
        stack: error instanceof Error ? error.stack : undefined 
      }, 'Error en WhatsAppService.uploadMedia')
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

      logger.info({ 
        to, 
        mediaId, 
        filename,
        phoneNumberId: this.config.phoneNumberId,
        apiVersion: this.config.apiVersion 
      }, '📤 Enviando documento con media_id a WhatsApp')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json() as WhatsAppResponse

      // Log completo de la respuesta para debugging
      logger.info({ 
        status: response.status,
        response: data,
        to,
        mediaId 
      }, '📥 Respuesta completa de WhatsApp al enviar documento')

      if (!response.ok) {
        logger.error({ response: data, payload }, '❌ Error enviando documento por WhatsApp')
        return false
      }

      // Verificar que el mensaje fue aceptado
      const messageId = data.messages?.[0]?.id
      const messageStatus = data.messages?.[0]?.message_status
      const hasContacts = data.contacts && data.contacts.length > 0

      logger.info({ 
        to, 
        filename, 
        messageId,
        messageStatus,
        contacts: data.contacts,
        hasContacts
      }, messageId ? '✅ Documento enviado por WhatsApp' : '⚠️ Documento enviado pero sin message_id')

      return !!messageId
    } catch (error) {
      logger.error({ error, to, mediaId }, '❌ Error en WhatsAppService.sendDocumentByMediaId')
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

      const data = await response.json() as WhatsAppResponse

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

      const data = await response.json() as WhatsAppResponse

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
   * Envía un mensaje interactivo con documento en header y botón CTA
   */
  async sendDocumentWithButton(
    to: string,
    documentUrl: string,
    bodyText: string,
    buttonText: string,
    buttonUrl: string,
    footerText?: string
  ): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`

      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          header: {
            type: 'document',
            document: {
              link: documentUrl,
            },
          },
          body: {
            text: bodyText,
          },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: buttonText,
              url: buttonUrl,
            },
          },
        },
      }

      // Añadir footer si se proporciona
      if (footerText) {
        payload.interactive.footer = { text: footerText }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.accessToken}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json() as WhatsAppResponse

      if (!response.ok) {
        logger.error({ response: data }, 'Error enviando documento con botón por WhatsApp')
        return false
      }

      // Verificar que el mensaje fue aceptado
      const messageStatus = data.messages?.[0]?.message_status
      const messageId = data.messages?.[0]?.id
      const hasContacts = data.contacts && data.contacts.length > 0
      const wasAccepted = (messageStatus === 'accepted' || messageId) && hasContacts

      if (!wasAccepted) {
        logger.warn({ response: data, to }, 'Documento con botón enviado pero sin confirmación')
        return false
      }

      logger.info(
        { to, buttonText, messageId, messageStatus, contacts: data.contacts },
        '✅ Documento con botón enviado y aceptado por WhatsApp'
      )
      return true
    } catch (error) {
      logger.error({ error }, 'Error en WhatsAppService.sendDocumentWithButton')
      return false
    }
  }

  /**
   * Envía un mensaje con dos botones CTA URL (solo funciona si la API lo soporta)
   * Nota: La mayoría de versiones de WhatsApp API solo soportan 1 botón CTA URL
   * Para múltiples botones, usar Reply Buttons en su lugar
   */
  async sendMessageWithTwoButtons(
    to: string,
    bodyText: string,
    button1Text: string,
    button1Url: string,
    button2Text: string,
    button2Url: string
  ): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`

      // Intentar con dos botones CTA - puede fallar si no está soportado
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          body: {
            text: bodyText,
          },
          action: {
            name: 'cta_url',
            parameters: [
              {
                display_text: button1Text,
                url: button1Url,
              },
              {
                display_text: button2Text,
                url: button2Url,
              }
            ],
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

      const data = await response.json() as WhatsAppResponse

      if (!response.ok) {
        logger.error({ response: data }, 'Error enviando mensaje con dos botones por WhatsApp')
        return false
      }

      const messageStatus = data.messages?.[0]?.message_status
      const messageId = data.messages?.[0]?.id
      const wasAccepted = messageStatus === 'accepted' || messageId

      if (!wasAccepted) {
        logger.warn({ response: data, to }, 'Mensaje con dos botones enviado pero sin confirmación')
        return false
      }

      logger.info(
        { to, messageId, messageStatus },
        '✅ Mensaje con dos botones enviado'
      )
      return true
    } catch (error) {
      logger.error({ error }, 'Error en WhatsAppService.sendMessageWithTwoButtons')
      return false
    }
  }

  /**
   * Envía un mensaje con botón de link (URL)
   */
  async sendMessageWithButton(
    to: string,
    bodyText: string,
    buttonText: string,
    buttonUrl: string
  ): Promise<boolean> {
    try {
      const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.phoneNumberId}/messages`

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'cta_url',
          body: {
            text: bodyText,
          },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: buttonText,
              url: buttonUrl,
            },
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

      const data = await response.json() as WhatsAppResponse

      if (!response.ok) {
        logger.error({ response: data }, 'Error enviando mensaje con botón por WhatsApp')
        return false
      }

      // Verificar que el mensaje fue aceptado
      const messageStatus = data.messages?.[0]?.message_status
      const messageId = data.messages?.[0]?.id
      const wasAccepted = messageStatus === 'accepted' || messageId // Algunos tienen status, otros solo ID

      if (!wasAccepted) {
        logger.warn({ response: data, to }, 'Mensaje enviado pero sin confirmación de WhatsApp')
        return false
      }

      logger.info(
        { to, buttonText, messageId, messageStatus, contacts: data.contacts },
        'Mensaje con botón enviado y aceptado por WhatsApp'
      )
      return true
    } catch (error) {
      logger.error({ error }, 'Error en WhatsAppService.sendMessageWithButton')
      return false
    }
  }

  /**
   * Envía la cotización al cliente y al gerente con botón para descargar PDF
   */
  async enviarCotizacionConLink(
    telefonoCliente: string,
    telefonoGerente: string,
    pdfUrl: string,
    numeroCotizacion: string
  ): Promise<{ cliente: boolean; gerente: boolean }> {
    const mensajeCliente = `¡Hola! Tu cotización #${numeroCotizacion} está lista. Haz clic en el botón para descargarla.`
    const mensajeGerente = `Nueva cotización #${numeroCotizacion} generada y enviada al cliente.`

    const [clienteEnviado, gerenteEnviado] = await Promise.all([
      this.sendMessageWithButton(telefonoCliente, mensajeCliente, '📄 Ver Cotización', pdfUrl),
      this.sendMessageWithButton(telefonoGerente, mensajeGerente, '📄 Ver Cotización', pdfUrl),
    ])

    return {
      cliente: clienteEnviado,
      gerente: gerenteEnviado,
    }
  }

  /**
   * Envía la cotización al cliente y al gerente usando el buffer del PDF
   */
  async enviarCotizacionConBuffer(
    telefonoCliente: string,
    telefonoGerente: string,
    pdfBuffer: Buffer,
    numeroCotizacion: string
  ): Promise<{ cliente: boolean; gerente: boolean }> {
    const filename = `Cotizacion_${numeroCotizacion}.pdf`
    const captionCliente = `Hola! Aquí está tu cotización #${numeroCotizacion}. Cualquier duda, estamos para ayudarte.`
    const captionGerente = `Nueva cotización #${numeroCotizacion} generada y enviada al cliente.`

    // Subir el PDF a WhatsApp y obtener media ID
    const mediaId = await this.uploadMedia(pdfBuffer, 'application/pdf')
    if (!mediaId) {
      logger.error('No se pudo subir el PDF a WhatsApp')
      return { cliente: false, gerente: false }
    }

    // Enviar usando el media ID
    const [clienteEnviado, gerenteEnviado] = await Promise.all([
      this.sendDocumentByMediaId(telefonoCliente, mediaId, filename, captionCliente),
      this.sendDocumentByMediaId(telefonoGerente, mediaId, filename, captionGerente),
    ])

    return {
      cliente: clienteEnviado,
      gerente: gerenteEnviado,
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
   * Envía la cotización al cliente y al gerente usando Media ID (PDF subido a WhatsApp)
   * Este es el método RECOMENDADO para enviar PDFs
   */
  async enviarCotizacionConMediaId(
    telefonoCliente: string,
    telefonoGerente: string,
    mediaId: string,
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
    
    // Enviar documento al cliente usando media_id
    const clienteEnviado = await this.sendDocumentByMediaId(
      telefonoCliente,
      mediaId,
      filename,
      captionCliente
    )

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

    // Enviar documento PDF al gerente usando el mismo media_id
    const gerenteEnviado = await this.sendDocumentByMediaId(
      telefonoGerente,
      mediaId,
      filename,
      bodyGerente
    )

    logger.info({ 
      cliente: clienteEnviado,
      gerente: gerenteEnviado,
      mediaId
    }, '📱 Resultado envío cotización por WhatsApp (usando media_id)')

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
