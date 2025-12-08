import type { HttpContext } from '@adonisjs/core/http'
import DatosEmpresa from '#models/datos_empresa'

export default class DatosEmpresaController {
  /**
   * GET /api/datos-empresa
   * Obtener los datos de la empresa (siempre hay un único registro con key='empresa')
   */
  async index({ response }: HttpContext) {
    try {
      const datos = await DatosEmpresa.first()

      if (!datos) {
        return response.notFound({
          success: false,
          message: 'No se encontraron datos de la empresa. Debe crear el registro inicial.',
        })
      }

      return response.ok({
        success: true,
        data: datos,
      })
    } catch (error) {
      console.error('Error obteniendo datos empresa:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al obtener datos de la empresa',
        error: error.message,
      })
    }
  }

  /**
   * POST /api/datos-empresa
   * Crear los datos de la empresa (solo si no existen)
   */
  async store({ request, response }: HttpContext) {
    try {
      const existente = await DatosEmpresa.first()

      if (existente) {
        return response.conflict({
          success: false,
          message: 'Ya existen datos de empresa. Use PUT para actualizar.',
        })
      }

      const datos = await DatosEmpresa.create({
        key: 'empresa',
        nit: request.input('nit'),
        bancolombiaCc: request.input('bancolombia_cc'),
        daviviendaCc: request.input('davivienda_cc'),
        daviviendaCa: request.input('davivienda_ca'),
        direccion: request.input('direccion'),
        lat: request.input('lat'),
        lng: request.input('lng'),
        emailGerente: request.input('email_gerente'),
        whatsappGerente: request.input('whatsapp_gerente'),
      })

      return response.created({
        success: true,
        message: 'Datos de empresa creados exitosamente',
        data: datos,
      })
    } catch (error) {
      console.error('Error creando datos empresa:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al crear datos de la empresa',
        error: error.message,
      })
    }
  }

  /**
   * PUT /api/datos-empresa
   * Actualizar los datos de la empresa
   */
  async update({ request, response }: HttpContext) {
    try {
      const datos = await DatosEmpresa.first()

      if (!datos) {
        return response.notFound({
          success: false,
          message: 'No se encontraron datos de la empresa. Use POST para crear.',
        })
      }

      // Actualizar solo los campos proporcionados
      if (request.input('nit') !== undefined) datos.nit = request.input('nit')
      if (request.input('bancolombia_cc') !== undefined)
        datos.bancolombiaCc = request.input('bancolombia_cc')
      if (request.input('davivienda_cc') !== undefined)
        datos.daviviendaCc = request.input('davivienda_cc')
      if (request.input('davivienda_ca') !== undefined)
        datos.daviviendaCa = request.input('davivienda_ca')
      if (request.input('direccion') !== undefined) datos.direccion = request.input('direccion')
      if (request.input('lat') !== undefined) datos.lat = request.input('lat')
      if (request.input('lng') !== undefined) datos.lng = request.input('lng')
      if (request.input('email_gerente') !== undefined)
        datos.emailGerente = request.input('email_gerente')
      if (request.input('whatsapp_gerente') !== undefined)
        datos.whatsappGerente = request.input('whatsapp_gerente')

      await datos.save()

      return response.ok({
        success: true,
        message: 'Datos de empresa actualizados exitosamente',
        data: datos,
      })
    } catch (error) {
      console.error('Error actualizando datos empresa:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al actualizar datos de la empresa',
        error: error.message,
      })
    }
  }

  /**
   * GET /api/datos-empresa/whatsapp
   * Obtener solo el número de WhatsApp (endpoint público)
   */
  async getWhatsapp({ response }: HttpContext) {
    try {
      const datos = await DatosEmpresa.first()

      if (!datos || !datos.whatsappGerente) {
        return response.ok({
          success: true,
          data: {
            whatsappGerente: null,
          },
        })
      }

      return response.ok({
        success: true,
        data: {
          whatsappGerente: datos.whatsappGerente,
        },
      })
    } catch (error) {
      console.error('Error obteniendo WhatsApp:', error)
      return response.internalServerError({
        success: false,
        message: 'Error al obtener número de WhatsApp',
      })
    }
  }
}
