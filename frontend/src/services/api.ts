// API Service - Centraliza todas las llamadas al backend
const API_BASE_URL = 'http://localhost:3333'

// Helper para hacer peticiones
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  // Agregar token de autenticación si existe
  const auth = localStorage.getItem('adminAuth')
  if (auth) {
    try {
      const authData = JSON.parse(auth)
      if (authData.token && authData.token !== 'demo-token') {
        defaultHeaders['Authorization'] = `Bearer ${authData.token}`
      }
    } catch (e) {
      console.warn('Error parsing auth data:', e)
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    
    // Si es 401, limpiar auth y redirigir
    if (response.status === 401) {
      localStorage.removeItem('adminAuth')
      window.location.href = '/admin/login'
      throw new Error('No autorizado')
    }
    
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// ============================================
// COTIZACIONES / RESERVAS
// ============================================

export interface Cotizacion {
  id: number
  numero: string
  cliente: {
    nombre: string
    email: string
    telefono: string | null
  }
  evento: {
    fecha: string
    hora: string
    duracion: number
    asistentes: number
    tipo: string
    salon: string | null
    espacio_id: number
  }
  totales: {
    valor_total: number
    abono_requerido: number
    total_pagado: number
    saldo_pendiente: number
  }
  estado: string
  estado_pago: string
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface CotizacionDetalle extends Cotizacion {
  detalles: Array<{
    servicio: string
    cantidad: number
    valorUnitario: number
    total: number
  }>
  observaciones: string | null
}

export interface CotizacionFiltros {
  estado?: string
  estado_pago?: string
  email?: string
  fecha?: string
  fecha_desde?: string
  fecha_hasta?: string
  espacio_id?: number
  tipo_evento?: string
  buscar?: string
  limit?: number
  page?: number
}

export const cotizacionesAPI = {
  // Crear cotización (para formulario público)
  async crear(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cotizaciones`, {
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

  // Listar cotizaciones con filtros
  async listar(filtros: CotizacionFiltros = {}) {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })
    
    const queryString = params.toString()
    const endpoint = queryString ? `/api/cotizaciones?${queryString}` : '/api/cotizaciones'
    
    return fetchAPI(endpoint)
  },

  // Obtener detalle de cotización
  async obtener(id: number): Promise<{ success: boolean; data: CotizacionDetalle }> {
    return fetchAPI(`/api/cotizaciones/${id}`)
  },

  // Editar cotización
  async actualizar(id: number, datos: any) {
    return fetchAPI(`/api/cotizaciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    })
  },

  // Cerrar cotización (convertir en reserva)
  async cerrar(id: number, datos: { estadoPago: 'abonado' | 'pagado'; montoPago?: number }) {
    return fetchAPI(`/api/cotizaciones/${id}/cerrar`, {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  // Rechazar cotización
  async rechazar(id: number, motivo?: string) {
    return fetchAPI(`/api/cotizaciones/${id}/rechazar`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    })
  },

  // Registrar pago adicional
  async registrarPago(id: number, datos: { monto: number; metodoPago?: string; observaciones?: string }) {
    return fetchAPI(`/api/cotizaciones/${id}/registrar-pago`, {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  // Descargar PDF
  getPdfUrl(cotizacionId: number): string {
    return `${API_BASE_URL}/api/cotizaciones/${cotizacionId}/pdf`
  },

  async descargarPdf(cotizacionId: number) {
    try {
      const url = this.getPdfUrl(cotizacionId)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error descargando PDF:', error)
      throw error
    }
  },

  // Reenviar correo
  async reenviarCorreo(id: number) {
    return fetchAPI(`/api/cotizaciones/${id}/enviar-correo`, {
      method: 'POST',
    })
  },
}

// ============================================
// DISPONIBILIDAD Y CALENDARIO
// ============================================

export const disponibilidadAPI = {
  // Obtener horas disponibles
  async obtenerHoras(espacioId: number, fecha: string, duracion?: number) {
    const params = new URLSearchParams({
      espacioId: String(espacioId),
      fecha,
    })
    
    if (duracion) {
      params.append('duracion', String(duracion))
    }
    
    return fetchAPI(`/api/disponibilidad/horas?${params.toString()}`)
  },
}

// ============================================
// ESPACIOS (Admin)
// ============================================

export interface Espacio {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
  configuraciones: Array<{
    id: number
    disposicionId: number
    disposicionNombre: string | null
    capacidad: number
  }>
}

export interface Disposicion {
  id: number
  nombre: string
}

export const espaciosAdminAPI = {
  // Listar espacios
  async listar(): Promise<{ success: boolean; data: Espacio[] }> {
    return fetchAPI('/admin/espacios')
  },

  // Obtener espacio
  async obtener(id: number): Promise<{ success: boolean; data: Espacio }> {
    return fetchAPI(`/admin/espacios/${id}`)
  },

  // Crear espacio
  async crear(datos: { nombre: string; descripcion?: string; activo?: boolean }) {
    return fetchAPI('/admin/espacios', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  // Actualizar espacio
  async actualizar(id: number, datos: { nombre?: string; descripcion?: string; activo?: boolean }) {
    return fetchAPI(`/admin/espacios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    })
  },

  // Agregar configuración (disposición)
  async agregarConfiguracion(espacioId: number, datos: { disposicionId: number; capacidad: number }) {
    return fetchAPI(`/admin/espacios/${espacioId}/configuraciones`, {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  // Actualizar configuración
  async actualizarConfiguracion(espacioId: number, configId: number, datos: { capacidad: number }) {
    return fetchAPI(`/admin/espacios/${espacioId}/configuraciones/${configId}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    })
  },

  // Eliminar configuración
  async eliminarConfiguracion(espacioId: number, configId: number) {
    return fetchAPI(`/admin/espacios/${espacioId}/configuraciones/${configId}`, {
      method: 'DELETE',
    })
  },

  // Listar disposiciones
  async listarDisposiciones(): Promise<{ success: boolean; data: Disposicion[] }> {
    return fetchAPI('/admin/disposiciones')
  },

  // Crear disposición
  async crearDisposicion(datos: { nombre: string }) {
    return fetchAPI('/admin/disposiciones', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },

  // Actualizar disposición
  async actualizarDisposicion(id: number, datos: { nombre: string }) {
    return fetchAPI(`/admin/disposiciones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    })
  },
}

// ============================================
// ESPACIOS PÚBLICOS (Para formularios)
// ============================================

export const espaciosPublicosAPI = {
  // Listar espacios simplificado
  async listarSimplificado() {
    return fetchAPI('/api/espacios/simplificado')
  },

  // Obtener tarifas de un espacio
  async obtenerTarifas(espacioId: number) {
    return fetchAPI(`/api/espacios/${espacioId}/tarifas`)
  },

  // Obtener configuraciones de un espacio
  async obtenerConfiguraciones(espacioId: number) {
    return fetchAPI(`/api/espacios/${espacioId}/configuraciones`)
  },
}

// ============================================
// UTILIDADES
// ============================================

export function formatearPrecio(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor)
}

export function formatearFecha(fecha: string): string {
  const date = new Date(fecha + 'T00:00:00')
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatearFechaCorta(fecha: string): string {
  const date = new Date(fecha + 'T00:00:00')
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function formatearHora(hora: string): string {
  // Convertir "14:00" a "2:00 PM"
  const [hours, minutes] = hora.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function getBadgeClass(estado: string): string {
  const badges: Record<string, string> = {
    'Pendiente de aprobación': 'badge-warning',
    'Aceptada': 'badge-success',
    'Rechazada': 'badge-danger',
    'Vencida': 'badge-secondary',
    'Sin pagar': 'badge-secondary',
    'Abono pendiente': 'badge-warning',
    'Abonado': 'badge-info',
    'Pagado completamente': 'badge-success',
  }
  return badges[estado] || 'badge-secondary'
}

