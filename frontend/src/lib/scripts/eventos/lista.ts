import { createClient } from '@supabase/supabase-js'

// Configuración
const API_URL = (import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3333').replace(/\/$/, '')
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
const BUCKET_NAME = 'eventos_imagenes'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface Imagen {
  url: string
  alt: string
}

interface Evento {
  id: number
  espacioId: number | null
  titulo: string
  slug: string
  excerpt: string | null
  content: string
  imagenes: Imagen[] | null
  publicado: boolean
  publishedAt: string | null
  espacio?: {
    id: number
    nombre: string
  }
}

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {

let eventos: Evento[] = []
let eventosFiltrados: Evento[] = []
let espacios: any[] = []
let currentPage = 1
const itemsPerPage = 10

// Elementos del DOM
const eventosList = document.getElementById('eventosList')
const btnNuevoEvento = document.getElementById('btnNuevoEvento')
const filtroEspacio = document.getElementById('filtroEspacio') as HTMLSelectElement
const paginationContainer = document.getElementById('paginationContainer')
const totalEventosSpan = document.getElementById('totalEventos')





// Funciones auxiliares
function generateSlug(titulo: string): string {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success') {
  const container = document.getElementById('toastContainer')
  if (!container) return
  
  const toast = document.createElement('div')
  toast.className = `toast ${type}`
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '⚠'
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `
  
  container.appendChild(toast)
  
  const closeBtn = toast.querySelector('.toast-close')
  closeBtn?.addEventListener('click', () => removeToast(toast))
  
  setTimeout(() => removeToast(toast), 5000)
}

function removeToast(toast: HTMLElement) {
  toast.classList.add('removing')
  setTimeout(() => toast.remove(), 300)
}



function getAuthToken(): string | null {
  const authData = localStorage.getItem('adminAuth')
  return authData ? JSON.parse(authData).token : null
}

// Cargar espacios
async function cargarEspacios() {
  try {
    const response = await fetch(`${API_URL}/api/espacios`)
    const result = await response.json()
    if (result.success) {
      espacios = result.data
      renderFiltroEspacios()
    }
  } catch (error) {
    console.error('Error cargando espacios:', error)
  }
}

function renderFiltroEspacios() {
  if (!filtroEspacio) return
  filtroEspacio.innerHTML = '<option value="">Todos los salones</option>'
  espacios.forEach(espacio => {
    const option = document.createElement('option')
    option.value = espacio.id.toString()
    option.textContent = espacio.nombre
    filtroEspacio.appendChild(option)
  })
}



// Cargar eventos
async function cargarEventos() {
  if (!eventosList) return
  
  eventosList.innerHTML = '<div class="placeholder">Cargando eventos...</div>'
  
  try {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/admin/salon-posts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const result = await response.json()
    
    if (result.success) {
      eventos = result.data
      aplicarFiltros()
    } else {
      eventosList.innerHTML = '<div class="placeholder">Error al cargar eventos</div>'
    }
  } catch (error) {
    console.error('Error cargando eventos:', error)
    eventosList.innerHTML = '<div class="placeholder">Error de conexión</div>'
  }
}

function aplicarFiltros() {
  const espacioSeleccionado = filtroEspacio?.value
  
  eventosFiltrados = eventos.filter(evento => {
    if (espacioSeleccionado && evento.espacioId?.toString() !== espacioSeleccionado) {
      return false
    }
    return true
  })
  
  currentPage = 1
  renderEventos()
  renderPaginacion()
  actualizarContador()
}

function actualizarContador() {
  if (totalEventosSpan) {
    totalEventosSpan.textContent = `${eventosFiltrados.length} evento${eventosFiltrados.length !== 1 ? 's' : ''}`
  }
}

function renderEventos() {
  if (!eventosList) return
  
  if (eventosFiltrados.length === 0) {
    eventosList.innerHTML = '<div class="placeholder">No hay eventos que coincidan con los filtros.</div>'
    return
  }
  
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const eventosPagina = eventosFiltrados.slice(start, end)
  
  eventosList.innerHTML = eventosPagina.map(evento => {
    const primeraImagen = evento.imagenes && evento.imagenes.length > 0 
      ? evento.imagenes[0].url 
      : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="75" viewBox="0 0 100 75"%3E%3Crect fill="%23f3f4f6" width="100" height="75"/%3E%3Ctext x="50" y="40" font-family="Arial" font-size="12" fill="%239ca3af" text-anchor="middle"%3ESin imagen%3C/text%3E%3C/svg%3E'
    
    const fecha = evento.publishedAt 
      ? new Date(evento.publishedAt).toLocaleDateString('es-CO', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })
      : 'Sin fecha'
    
    const salonTag = evento.espacio?.nombre 
      ? `<span class="evento-tag salon-tag">${evento.espacio.nombre}</span>` 
      : ''
    
    return `
      <div class="post-card" data-evento-id="${evento.id}">
        <img src="${primeraImagen}" alt="${evento.titulo}" />
        <div class="post-info">
          ${salonTag}
          <h3 class="post-title">${evento.titulo}</h3>
          <div class="post-meta">
            <span>${fecha}</span>
          </div>
        </div>
        <div class="post-actions">
          <button type="button" class="btn secondary" data-action="editar" data-id="${evento.id}">Editar</button>
          <button type="button" class="btn ghost" data-action="eliminar" data-id="${evento.id}">Eliminar</button>
        </div>
      </div>
    `
  }).join('')
}

function renderPaginacion() {
  if (!paginationContainer) return
  
  const totalPages = Math.ceil(eventosFiltrados.length / itemsPerPage)
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = ''
    return
  }
  
  let paginationHTML = '<div class="pagination">'
  
  // Botón anterior
  if (currentPage > 1) {
    paginationHTML += `<button class="pagination-btn" data-page="${currentPage - 1}">← Anterior</button>`
  }
  
  // Números de página
  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, currentPage + 2)
  
  if (startPage > 1) {
    paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`
    if (startPage > 2) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`
    }
    paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`
  }
  
  // Botón siguiente
  if (currentPage < totalPages) {
    paginationHTML += `<button class="pagination-btn" data-page="${currentPage + 1}">Siguiente →</button>`
  }
  
  paginationHTML += '</div>'
  paginationContainer.innerHTML = paginationHTML
}











// Modal de confirmación
let eventoIdToDelete: number | null = null

function mostrarModalEliminar(id: number) {
  eventoIdToDelete = id
  const modal = document.getElementById('confirmModal')
  if (modal) {
    modal.classList.remove('hidden')
  }
}

function ocultarModalEliminar() {
  eventoIdToDelete = null
  const modal = document.getElementById('confirmModal')
  if (modal) {
    modal.classList.add('hidden')
  }
}

// Eliminar evento
async function eliminarEvento() {
  if (!eventoIdToDelete) return
  
  ocultarModalEliminar()
  
  try {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/admin/salon-posts/${eventoIdToDelete}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      showNotification('Evento eliminado exitosamente')
      await cargarEventos()
    } else {
      showNotification('Error al eliminar', 'error')
    }
  } catch (error) {
    console.error('Error eliminando evento:', error)
    showNotification('Error de conexión', 'error')
  } finally {
    eventoIdToDelete = null
  }
}

// Event listeners
btnNuevoEvento?.addEventListener('click', (e) => {
  e.preventDefault()
  window.location.href = '/admin/eventos/nuevo'
})

filtroEspacio?.addEventListener('change', aplicarFiltros)

// Paginación
paginationContainer?.addEventListener('click', (e) => {
  const target = e.target as HTMLElement
  if (target.classList.contains('pagination-btn')) {
    const page = parseInt(target.getAttribute('data-page') || '1')
    currentPage = page
    renderEventos()
    renderPaginacion()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

// Delegación de eventos para la lista
if (eventosList) {
  eventosList.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    
    // Verificar si es un botón o está dentro de un botón
    const button = target.matches('button[data-action]') 
      ? target as HTMLButtonElement
      : target.closest('button[data-action]') as HTMLButtonElement
    
    if (!button) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const action = button.getAttribute('data-action')
    const id = button.getAttribute('data-id')
    
    if (action === 'editar' && id) {
      window.location.href = `/admin/eventos/${id}/editar`
    } else if (action === 'eliminar' && id) {
      mostrarModalEliminar(parseInt(id))
    }
  }, false)
}

// Event listeners del modal
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar')
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar')
const confirmModal = document.getElementById('confirmModal')

btnConfirmarEliminar?.addEventListener('click', eliminarEvento)
btnCancelarEliminar?.addEventListener('click', ocultarModalEliminar)

// Cerrar modal al hacer clic fuera
confirmModal?.addEventListener('click', (e) => {
  if (e.target === confirmModal) {
    ocultarModalEliminar()
  }
})

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && eventoIdToDelete !== null) {
    ocultarModalEliminar()
  }
})

// Inicializar
async function init() {
  await cargarEspacios()
  await cargarEventos()
}

init()

}) // Fin DOMContentLoaded
