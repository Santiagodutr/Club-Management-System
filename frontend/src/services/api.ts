// API Service para interactuar con el backend
const API_URL = 'http://localhost:3333'

export const cotizacionesAPI = {
  /**
   * Crear una nueva cotización
   */
  async crear(data) {
    try {
      const response = await fetch(`${API_URL}/api/cotizaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creando cotización:', error)
      return {
        success: false,
        message: 'Error al crear la cotización',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },

  /**
   * Obtener URL del PDF
   */
  getPdfUrl(cotizacionId) {
    return `${API_URL}/api/cotizaciones/${cotizacionId}/pdf`
  },

  /**
   * Descargar PDF
   */
  async descargarPdf(cotizacionId) {
    try {
      const url = this.getPdfUrl(cotizacionId)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error descargando PDF:', error)
      throw error
    }
  },
}

