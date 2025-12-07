interface ImagenEspacio {
  url: string
  alt: string
  es_portada: boolean
}

interface Espacio {
  id: number
  nombre: string
  slug: string
  capacidad_minima: number | null
  capacidad_maxima: number | null
  destacado: boolean
  activo: boolean
  imagenes: ImagenEspacio[] | null
}

let espacios: Espacio[] = []

function verificarCambiosPendientes() {
  const hayCambios = localStorage.getItem('hayCambiosSinPublicar') === 'true'
  if (hayCambios) {
    const btnPublicar = document.getElementById('btnPublicarCambios') as HTMLButtonElement
    if (btnPublicar) {
      btnPublicar.style.display = 'inline-flex'
    }
  }
}

function mostrarModalPublicar() {
  const modal = document.getElementById('publicarModal')
  if (modal) {
    modal.classList.remove('hidden')
  }
}

function cerrarModalPublicar() {
  const modal = document.getElementById('publicarModal')
  if (modal) {
    modal.classList.add('hidden')
  }
  const mensaje = document.getElementById('mensajePublicar')
  if (mensaje) {
    mensaje.classList.add('hidden')
    mensaje.textContent = ''
  }
}

function mostrarMensajePublicar(texto: string, tipo: 'exito' | 'error' | 'info') {
  const mensaje = document.getElementById('mensajePublicar')
  if (!mensaje) return
  
  mensaje.classList.remove('hidden', 'exito', 'error', 'info')
  mensaje.classList.add(tipo)
  mensaje.textContent = texto
}

async function publicarCambios() {
  const btnConfirmar = document.getElementById('btnConfirmarPublicar') as HTMLButtonElement
  const btnCancelar = document.getElementById('btnCancelarPublicar') as HTMLButtonElement
  
  if (btnConfirmar) {
    btnConfirmar.disabled = true
    btnConfirmar.textContent = 'Publicando...'
  }
  if (btnCancelar) btnCancelar.disabled = true

  mostrarMensajePublicar('Iniciando publicación...', 'info')

  try {
    const adminAuth = localStorage.getItem('adminAuth')
    if (!adminAuth) {
      throw new Error('No hay sesión activa')
    }

    const { token } = JSON.parse(adminAuth)
    const backendUrl = (import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3333').replace(/\/$/, '')

    const response = await fetch(`${backendUrl}/admin/trigger-rebuild`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Error al publicar: ${response.statusText}`)
    }

    mostrarMensajePublicar('✅ Publicación iniciada exitosamente. Los cambios se verán en el sitio en 2-3 minutos.', 'exito')
    localStorage.removeItem('hayCambiosSinPublicar')
    
    const btnPublicar = document.getElementById('btnPublicarCambios') as HTMLButtonElement
    if (btnPublicar) {
      btnPublicar.style.display = 'none'
    }
    
    setTimeout(() => {
      cerrarModalPublicar()
      if (btnConfirmar) {
        btnConfirmar.disabled = false
        btnConfirmar.textContent = 'Publicar Ahora'
      }
      if (btnCancelar) btnCancelar.disabled = false
    }, 3000)

  } catch (error) {
    console.error('Error al publicar:', error)
    mostrarMensajePublicar(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error')
    
    if (btnConfirmar) {
      btnConfirmar.disabled = false
      btnConfirmar.textContent = 'Publicar Ahora'
    }
    if (btnCancelar) btnCancelar.disabled = false
  }
}

async function init() {
  await cargarEspacios()
  setupEventListeners()
  verificarCambiosPendientes()
}

function setupEventListeners() {
  document.getElementById('btnRefrescarEspacios')?.addEventListener('click', cargarEspacios)
  document.getElementById('btnNuevoEspacio')?.addEventListener('click', () => {
    window.location.href = '/admin/espacios/nuevo'
  })
  
  // Setup modal publicar
  const btnPublicarCambios = document.getElementById('btnPublicarCambios')
  const btnCancelarPublicar = document.getElementById('btnCancelarPublicar')
  const btnConfirmarPublicar = document.getElementById('btnConfirmarPublicar')
  
  btnPublicarCambios?.addEventListener('click', mostrarModalPublicar)
  btnCancelarPublicar?.addEventListener('click', cerrarModalPublicar)
  btnConfirmarPublicar?.addEventListener('click', publicarCambios)
  
  // Delegación de eventos para botones de eliminar
  document.getElementById('espaciosList')?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const btn = target.closest('[data-action="eliminar"]')
    if (btn) {
      const id = btn.getAttribute('data-id')
      if (id) mostrarModalEliminar(parseInt(id))
    }
  })
  
  // Modal eliminar
  document.getElementById('btnCancelarEliminar')?.addEventListener('click', cerrarModalEliminar)
  document.getElementById('btnConfirmarEliminar')?.addEventListener('click', confirmarEliminar)
}

function mostrarModalEliminar(id: number) {
  const espacio = espacios.find(e => e.id === id)
  if (!espacio) return
  
  const modal = document.getElementById('confirmModal')
  const nombreSpan = document.getElementById('espacioEliminarNombre')
  
  if (modal && nombreSpan) {
    nombreSpan.textContent = espacio.nombre
    modal.setAttribute('data-espacio-id', id.toString())
    modal.classList.remove('hidden')
  }
}

function cerrarModalEliminar() {
  const modal = document.getElementById('confirmModal')
  if (modal) modal.classList.add('hidden')
}

async function confirmarEliminar() {
  const modal = document.getElementById('confirmModal')
  const espacioId = modal?.getAttribute('data-espacio-id')
  
  if (!espacioId) return
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`http://localhost:3333/api/espacios/${espacioId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) throw new Error('Error al eliminar')
    
    alert('Espacio eliminado exitosamente')
    cerrarModalEliminar()
    await cargarEspacios()
  } catch (error) {
    console.error('Error al eliminar espacio:', error)
    alert('Error al eliminar el espacio')
  }
}

async function cargarEspacios() {
  const container = document.getElementById('espaciosList')
  if (!container) return

  try {
    container.innerHTML = '<div class="placeholder">Cargando espacios...</div>'

    const response = await fetch('http://localhost:3333/api/espacios')
    if (!response.ok) throw new Error('Error al cargar espacios')

    const data = await response.json()
    espacios = data.data || data

    if (espacios.length === 0) {
      container.innerHTML = '<div class="placeholder">No hay espacios creados</div>'
      return
    }

    container.innerHTML = espacios
      .map((espacio) => {
        // Obtener imagen de portada o primera imagen
        const portada = espacio.imagenes?.find(img => img.es_portada) || espacio.imagenes?.[0]
        const imagenUrl = portada?.url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="75" viewBox="0 0 100 75"%3E%3Crect fill="%23f3f4f6" width="100" height="75"/%3E%3Ctext x="50" y="40" font-family="Arial" font-size="12" fill="%239ca3af" text-anchor="middle"%3ESin imagen%3C/text%3E%3C/svg%3E'
        
        const destacadoTag = espacio.destacado 
          ? '<span class="espacio-tag destacado-tag">⭐ Destacado</span>' 
          : ''
        
        return `
          <div class="espacio-card" data-espacio-id="${espacio.id}">
            <img src="${imagenUrl}" alt="${espacio.nombre}" />
            <div class="espacio-info">
              ${destacadoTag}
              <h3 class="espacio-nombre">${espacio.nombre}</h3>
              <div class="espacio-meta">
                <span class="pill ${espacio.activo ? 'pill-active' : 'pill-inactive'}">
                  ${espacio.activo ? '✓ Activo' : '✗ Inactivo'}
                </span>
                ${espacio.capacidad_maxima ? `<span>Cap: ${espacio.capacidad_maxima} personas</span>` : ''}
              </div>
            </div>
            <div class="espacio-actions">
              <a href="/admin/espacios/${espacio.id}/editar" class="btn secondary">Editar</a>
              <button type="button" class="btn ghost" data-action="eliminar" data-id="${espacio.id}">Eliminar</button>
            </div>
          </div>
        `
      })
      .join('')
  } catch (error) {
    console.error('Error al cargar espacios:', error)
    container.innerHTML = '<div class="placeholder">Error al cargar espacios</div>'
  }
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
