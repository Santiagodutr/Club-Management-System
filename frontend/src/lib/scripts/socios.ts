import { sociosAPI, type Socio } from '../../services/api'

type Maybe<T> = T | null

function qs<T extends HTMLElement>(sel: string): Maybe<T> {
  return document.querySelector(sel) as Maybe<T>
}

async function main() {
  // Verificar autenticación
  const authData = localStorage.getItem('adminAuth')
  if (!authData) {
    window.location.href = '/admin/login'
    return
  }

  // Referencias a elementos del DOM
  const btnNuevoSocio = qs<HTMLButtonElement>('#btnNuevoSocio')
  const sociosList = qs<HTMLDivElement>('#sociosList')
  const totalSocios = qs<HTMLSpanElement>('#totalSocios')

  // Modal de crear/editar
  const crearModal = qs<HTMLDivElement>('#crearModal')
  const btnCerrarCrear = qs<HTMLButtonElement>('#btnCerrarCrear')
  const btnCancelarCrear = qs<HTMLButtonElement>('#btnCancelarCrear')
  const formCrearSocio = qs<HTMLFormElement>('#formCrearSocio')
  const modalTitle = qs<HTMLHeadingElement>('#modalTitle')
  const btnGuardarSocio = qs<HTMLButtonElement>('#btnGuardarSocio')
  const socioId = qs<HTMLInputElement>('#socioId')
  const inputCodigo = qs<HTMLInputElement>('#inputCodigo')
  const inputActivo = qs<HTMLInputElement>('#inputActivo')
  const mensajeCrear = qs<HTMLDivElement>('#mensajeCrear')

  // Modal de eliminar
  const eliminarModal = qs<HTMLDivElement>('#eliminarModal')
  const btnCancelarEliminar = qs<HTMLButtonElement>('#btnCancelarEliminar')
  const btnConfirmarEliminar = qs<HTMLButtonElement>('#btnConfirmarEliminar')
  const codigoEliminar = qs<HTMLSpanElement>('#codigoEliminar')

  // Estado
  let socios: Socio[] = []
  let socioAEliminar: number | null = null

  // ============================================
  // FUNCIONES DE CARGA Y RENDERIZADO
  // ============================================

  async function cargarSocios() {
    try {
      if (sociosList) {
        sociosList.innerHTML = '<div class="placeholder">Cargando socios...</div>'
      }

      const response = await sociosAPI.listar()
      
      console.log('Respuesta API socios:', response)
      
      if (response.success) {
        socios = response.data
        console.log('Socios cargados:', socios)
        renderizarSocios()
        actualizarContadores()
      } else {
        mostrarError('Error al cargar socios')
      }
    } catch (error) {
      console.error('Error cargando socios:', error)
      mostrarError('Error al cargar la lista de socios')
    }
  }

  function renderizarSocios() {
    if (!sociosList) return

    if (socios.length === 0) {
      sociosList.innerHTML = '<div class="empty">No hay códigos de socios registrados</div>'
      return
    }

    sociosList.innerHTML = `
      <div class="table-wrapper">
        <table class="socios-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Estado</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${socios.map(socio => `
              <tr>
                <td>
                  <strong>${socio.codigo}</strong>
                </td>
                <td>
                  <span class="badge ${socio.activo ? 'badge-success' : 'badge-inactive'}">
                    ${socio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button 
                    type="button"
                    class="btn-action edit" 
                    data-action="editar" 
                    data-id="${socio.id}"
                    title="Editar socio"
                  >
                    Editar
                  </button>
                  <button 
                    type="button"
                    class="btn-action delete" 
                    data-action="eliminar" 
                    data-id="${socio.id}"
                    data-codigo="${socio.codigo}"
                    title="Eliminar socio"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `

    // Agregar event listeners a los botones de acción
    const buttons = sociosList.querySelectorAll('[data-action]')
    console.log('Botones encontrados:', buttons.length)
    buttons.forEach((btn) => {
      btn.addEventListener('click', handleAccion)
    })
  }

  function actualizarContadores() {
    if (!totalSocios) return
    const count = socios.length
    totalSocios.textContent = `${count} socio${count !== 1 ? 's' : ''}`
  }

  function formatearFecha(fecha: string): string {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function mostrarError(mensaje: string) {
    if (sociosList) {
      sociosList.innerHTML = `<div class="error">${mensaje}</div>`
    }
  }

  // ============================================
  // MODAL DE CREAR/EDITAR
  // ============================================

  function abrirModalCrear() {
    if (!crearModal || !modalTitle || !formCrearSocio || !btnGuardarSocio || !socioId || !inputCodigo || !inputActivo) return
    
    // Resetear formulario
    formCrearSocio.reset()
    socioId.value = ''
    inputActivo.checked = true
    
    // Configurar como modo crear
    modalTitle.textContent = 'Nuevo Socio'
    btnGuardarSocio.textContent = 'Crear Socio'
    
    // Ocultar mensaje
    ocultarMensaje()
    
    // Mostrar modal
    crearModal.classList.remove('hidden')
    inputCodigo?.focus()
  }

  function abrirModalEditar(id: number) {
    console.log('Buscando socio con ID:', id, 'Tipo:', typeof id)
    console.log('IDs disponibles:', socios.map(s => ({ id: s.id, tipo: typeof s.id })))
    
    const socio = socios.find(s => Number(s.id) === Number(id))
    
    console.log('Socio encontrado:', socio)
    
    if (!socio) {
      console.error('Socio no encontrado con ID:', id)
      return
    }
    
    if (!crearModal || !modalTitle || !formCrearSocio || !btnGuardarSocio || !socioId || !inputCodigo || !inputActivo) {
      console.error('Elementos del modal no encontrados')
      return
    }
    
    // Llenar formulario con datos del socio
    socioId.value = String(socio.id)
    inputCodigo.value = socio.codigo
    inputActivo.checked = socio.activo
    
    // Configurar como modo editar
    modalTitle.textContent = 'Editar Socio'
    btnGuardarSocio.textContent = 'Guardar Cambios'
    
    // Ocultar mensaje
    ocultarMensaje()
    
    // Mostrar modal
    console.log('Abriendo modal...')
    crearModal.classList.remove('hidden')
    inputCodigo?.focus()
  }

  function cerrarModalCrear() {
    if (crearModal) {
      crearModal.classList.add('hidden')
    }
    
    // Resetear formulario completamente
    if (formCrearSocio) {
      formCrearSocio.reset()
    }
    if (socioId) {
      socioId.value = ''
    }
    if (inputActivo) {
      inputActivo.checked = true
    }
    
    ocultarMensaje()
  }

  function mostrarMensajeCrear(mensaje: string, tipo: 'success' | 'error') {
    if (!mensajeCrear) return
    mensajeCrear.textContent = mensaje
    mensajeCrear.className = `mensaje ${tipo}`
    mensajeCrear.classList.remove('hidden')
  }

  function ocultarMensaje() {
    if (mensajeCrear) {
      mensajeCrear.classList.add('hidden')
    }
  }

  // ============================================
  // MODAL DE ELIMINAR
  // ============================================

  function abrirModalEliminar(id: number, codigo: string) {
    if (!eliminarModal || !codigoEliminar) return
    
    socioAEliminar = id
    codigoEliminar.textContent = codigo
    eliminarModal.classList.remove('hidden')
  }

  function cerrarModalEliminar() {
    if (eliminarModal) {
      eliminarModal.classList.add('hidden')
    }
    socioAEliminar = null
  }

  // ============================================
  // HANDLERS DE ACCIONES
  // ============================================

  function handleAccion(e: Event) {
    e.preventDefault()
    const btn = e.currentTarget as HTMLButtonElement
    const action = btn.dataset.action
    const id = Number(btn.dataset.id)
    const codigo = btn.dataset.codigo

    console.log('Acción:', action, 'ID:', id, 'Código:', codigo)

    switch (action) {
      case 'editar':
        abrirModalEditar(id)
        break
      case 'eliminar':
        if (codigo) {
          abrirModalEliminar(id, codigo)
        }
        break
    }
  }

  async function handleGuardarSocio(e: Event) {
    e.preventDefault()
    
    if (!socioId || !inputCodigo || !inputActivo || !btnGuardarSocio) return
    
    const id = socioId.value
    const codigo = inputCodigo.value.trim()
    const activo = inputActivo.checked
    
    if (!codigo) {
      mostrarMensajeCrear('El código es requerido', 'error')
      return
    }
    
    if (codigo.length < 3) {
      mostrarMensajeCrear('El código debe tener al menos 3 caracteres', 'error')
      return
    }
    
    if (codigo.length > 50) {
      mostrarMensajeCrear('El código no puede tener más de 50 caracteres', 'error')
      return
    }
    
    // Deshabilitar botón mientras se procesa
    btnGuardarSocio.disabled = true
    btnGuardarSocio.textContent = id ? 'Guardando...' : 'Creando...'
    
    try {
      let response
      
      if (id) {
        // Actualizar socio existente
        response = await sociosAPI.actualizar(Number(id), { codigo, activo })
      } else {
        // Crear nuevo socio
        response = await sociosAPI.crear({ codigo, activo })
      }
      
      if (response.success) {
        mostrarMensajeCrear(response.message || (id ? 'Socio actualizado exitosamente' : 'Socio creado exitosamente'), 'success')
        
        // Recargar lista
        await cargarSocios()
        
        // Cerrar modal después de un breve delay
        setTimeout(() => {
          cerrarModalCrear()
        }, 500)
      } else {
        mostrarMensajeCrear(response.message || 'Error al guardar el socio', 'error')
      }
    } catch (error: any) {
      console.error('Error guardando socio:', error)
      mostrarMensajeCrear(error.message || 'Error al guardar el socio', 'error')
    } finally {
      // Rehabilitar botón
      btnGuardarSocio.disabled = false
      btnGuardarSocio.textContent = id ? 'Guardar Cambios' : 'Crear Socio'
    }
  }

  async function handleConfirmarEliminar() {
    if (!socioAEliminar || !btnConfirmarEliminar) return
    
    btnConfirmarEliminar.disabled = true
    btnConfirmarEliminar.textContent = 'Eliminando...'
    
    try {
      const response = await sociosAPI.eliminar(socioAEliminar)
      
      if (response.success) {
        // Recargar lista
        await cargarSocios()
        
        // Cerrar modal
        cerrarModalEliminar()
      } else {
        alert(response.message || 'Error al eliminar el socio')
      }
    } catch (error: any) {
      console.error('Error eliminando socio:', error)
      alert(error.message || 'Error al eliminar el socio')
    } finally {
      btnConfirmarEliminar.disabled = false
      btnConfirmarEliminar.textContent = 'Eliminar'
    }
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  // Botón nuevo socio
  btnNuevoSocio?.addEventListener('click', abrirModalCrear)
  
  // Cerrar modal crear/editar
  btnCerrarCrear?.addEventListener('click', cerrarModalCrear)
  btnCancelarCrear?.addEventListener('click', cerrarModalCrear)
  
  // Cerrar modal al hacer click fuera
  crearModal?.addEventListener('click', (e) => {
    if (e.target === crearModal) {
      cerrarModalCrear()
    }
  })
  
  // Submit formulario
  formCrearSocio?.addEventListener('submit', handleGuardarSocio)
  
  // Modal eliminar
  btnCancelarEliminar?.addEventListener('click', cerrarModalEliminar)
  btnConfirmarEliminar?.addEventListener('click', handleConfirmarEliminar)
  
  // Cerrar modal eliminar al hacer click fuera
  eliminarModal?.addEventListener('click', (e) => {
    if (e.target === eliminarModal) {
      cerrarModalEliminar()
    }
  })
  
  // Tecla ESC para cerrar modales
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!crearModal?.classList.contains('hidden')) {
        cerrarModalCrear()
      }
      if (!eliminarModal?.classList.contains('hidden')) {
        cerrarModalEliminar()
      }
    }
  })

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  
  await cargarSocios()
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  main()
}
