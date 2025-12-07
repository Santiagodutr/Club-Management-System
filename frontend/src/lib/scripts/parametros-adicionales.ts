import { serviciosAdicionalesAPI, type ServicioAdicional } from '../../services/api'

let servicios: any[] = []
let servicioEditar: any | null = null
let servicioEliminar: any | null = null

// Elementos del DOM
const serviciosList = document.getElementById('serviciosList') as HTMLTableSectionElement
const btnNuevoServicio = document.getElementById('btnNuevoServicio') as HTMLButtonElement
const btnRefrescar = document.getElementById('btnRefrescar') as HTMLButtonElement
const filtroTipoCliente = document.getElementById('filtroTipoCliente') as HTMLSelectElement
const filtroEstado = document.getElementById('filtroEstado') as HTMLSelectElement

// Modal servicio
const modalServicio = document.getElementById('modalServicio') as HTMLDivElement
const modalTitle = document.getElementById('modalTitle') as HTMLHeadingElement
const formServicio = document.getElementById('formServicio') as HTMLFormElement
const btnCerrarModal = document.getElementById('btnCerrarModal') as HTMLButtonElement
const btnCancelar = document.getElementById('btnCancelar') as HTMLButtonElement
const btnGuardar = document.getElementById('btnGuardar') as HTMLButtonElement

// Campos del formulario
const servicioId = document.getElementById('servicioId') as HTMLInputElement
const inputNombre = document.getElementById('nombre') as HTMLInputElement
const inputDescripcion = document.getElementById('descripcion') as HTMLTextAreaElement
const inputTipoCliente = document.getElementById('tipoCliente') as HTMLSelectElement
const inputPrecio = document.getElementById('precio') as HTMLInputElement
const inputActivo = document.getElementById('activo') as HTMLInputElement

// Modal eliminar
const modalEliminar = document.getElementById('modalEliminar') as HTMLDivElement
const servicioEliminarNombre = document.getElementById('servicioEliminarNombre') as HTMLElement
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar') as HTMLButtonElement
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar') as HTMLButtonElement

// Mensajes
const mensajeExito = document.getElementById('mensajeExito') as HTMLDivElement
const mensajeExitoTexto = document.getElementById('mensajeExitoTexto') as HTMLSpanElement
const mensajeError = document.getElementById('mensajeError') as HTMLDivElement
const mensajeErrorTexto = document.getElementById('mensajeErrorTexto') as HTMLSpanElement

async function cargarServicios() {
  try {
    serviciosList.innerHTML = '<tr><td colspan="6" class="placeholder">Cargando servicios...</td></tr>'
    const response = await serviciosAdicionalesAPI.listar()
    servicios = response.data
    renderServicios()
  } catch (error) {
    console.error('Error al cargar servicios:', error)
    serviciosList.innerHTML = '<tr><td colspan="6" class="placeholder">Error al cargar servicios</td></tr>'
    mostrarError('No se pudieron cargar los servicios')
  }
}

function renderServicios() {
  let serviciosFiltrados = [...servicios]

  // Aplicar filtros
  const tipoFiltro = filtroTipoCliente.value
  if (tipoFiltro) {
    serviciosFiltrados = serviciosFiltrados.filter(s => s.tipo_cliente === tipoFiltro)
  }

  const estadoFiltro = filtroEstado.value
  if (estadoFiltro) {
    const estadoBool = estadoFiltro === 'true'
    serviciosFiltrados = serviciosFiltrados.filter(s => s.activo === estadoBool)
  }

  if (serviciosFiltrados.length === 0) {
    serviciosList.innerHTML = '<tr><td colspan="6" class="placeholder">No se encontraron servicios</td></tr>'
    return
  }

  serviciosList.innerHTML = serviciosFiltrados
    .map(servicio => {
      const precio = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(Number(servicio.precio))

      const tipoClienteBadge = servicio.tipo_cliente === 'socio' ? 'Socio' : 'Particular'
      const estadoBadge = servicio.activo ? 'Activo' : 'Inactivo'

      const descripcionDisplay = servicio.descripcion 
        ? `<div class="servicio-descripcion">${servicio.descripcion}</div>` 
        : '<div class="servicio-descripcion muted">Sin descripción</div>'

      return `
        <tr class="${!servicio.activo ? 'inactivo' : ''}">
          <td>
            <div class="servicio-nombre">${servicio.nombre}</div>
          </td>
          <td>${descripcionDisplay}</td>
          <td>${tipoClienteBadge}</td>
          <td><span class="servicio-precio">${precio}</span></td>
          <td>${estadoBadge}</td>
          <td>
            <div class="servicio-actions">
              <button class="btn-action edit" onclick="window.editarServicio(${servicio.id})">
                Editar
              </button>
              <button class="btn-action delete" onclick="window.abrirModalEliminar(${servicio.id})">
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      `
    })
    .join('')
}

function abrirModalNuevo() {
  servicioEditar = null
  modalTitle.textContent = 'Nuevo Servicio'
  
  servicioId.value = ''
  inputNombre.value = ''
  inputDescripcion.value = ''
  inputTipoCliente.value = ''
  inputPrecio.value = ''
  inputActivo.checked = true
  
  modalServicio.classList.remove('hidden')
}

function abrirModalEditar(id: number) {
  const servicio = servicios.find(s => s.id === id)
  if (!servicio) return

  servicioEditar = servicio
  modalTitle.textContent = 'Editar Servicio'
  
  servicioId.value = String(servicio.id)
  inputNombre.value = servicio.nombre
  inputDescripcion.value = servicio.descripcion || ''
  inputTipoCliente.value = servicio.tipo_cliente
  inputPrecio.value = String(servicio.precio)
  inputActivo.checked = servicio.activo
  
  modalServicio.classList.remove('hidden')
}

function cerrarModalServicio() {
  modalServicio.classList.add('hidden')
  servicioEditar = null
  formServicio.reset()
}

async function guardarServicio(e: Event) {
  e.preventDefault()

  const nombre = inputNombre.value.trim()
  const descripcion = inputDescripcion.value.trim() || null
  const tipoCliente = inputTipoCliente.value as 'socio' | 'particular'
  const precio = Number(inputPrecio.value)
  const activo = inputActivo.checked

  if (!nombre || !tipoCliente || precio < 0) {
    mostrarError('Completa todos los campos requeridos')
    return
  }

  try {
    btnGuardar.disabled = true

    const servicioData = {
      nombre,
      descripcion,
      tipo_cliente: tipoCliente,
      precio,
      activo,
    }

    if (servicioEditar) {
      await serviciosAdicionalesAPI.actualizar(servicioEditar.id, servicioData)
      mostrarExito('Servicio actualizado correctamente')
    } else {
      await serviciosAdicionalesAPI.crear(servicioData)
      mostrarExito('Servicio creado correctamente')
    }

    cerrarModalServicio()
    await cargarServicios()
  } catch (error) {
    console.error('Error al guardar servicio:', error)
    mostrarError('Error al guardar el servicio')
  } finally {
    btnGuardar.disabled = false
  }
}



function abrirModalEliminar(id: number) {
  const servicio = servicios.find(s => s.id === id)
  if (!servicio) return

  servicioEliminar = servicio
  servicioEliminarNombre.textContent = servicio.nombre
  modalEliminar.classList.remove('hidden')
}

function cerrarModalEliminar() {
  modalEliminar.classList.add('hidden')
  servicioEliminar = null
}

async function confirmarEliminar() {
  if (!servicioEliminar) return

  try {
    btnConfirmarEliminar.disabled = true
    await serviciosAdicionalesAPI.eliminar(servicioEliminar.id)
    mostrarExito('Servicio eliminado correctamente')
    cerrarModalEliminar()
    await cargarServicios()
  } catch (error) {
    console.error('Error al eliminar servicio:', error)
    mostrarError('Error al eliminar el servicio')
  } finally {
    btnConfirmarEliminar.disabled = false
  }
}

function mostrarExito(mensaje: string) {
  mensajeExitoTexto.textContent = mensaje
  mensajeExito.classList.remove('hidden')
  setTimeout(() => {
    mensajeExito.classList.add('hidden')
  }, 3000)
}

function mostrarError(mensaje: string) {
  mensajeErrorTexto.textContent = mensaje
  mensajeError.classList.remove('hidden')
  setTimeout(() => {
    mensajeError.classList.add('hidden')
  }, 3000)
}

// Event listeners
btnNuevoServicio.addEventListener('click', abrirModalNuevo)
btnRefrescar.addEventListener('click', cargarServicios)
filtroTipoCliente.addEventListener('change', renderServicios)
filtroEstado.addEventListener('change', renderServicios)

btnCerrarModal.addEventListener('click', cerrarModalServicio)
btnCancelar.addEventListener('click', cerrarModalServicio)
formServicio.addEventListener('submit', guardarServicio)
btnGuardar.addEventListener('click', (e) => {
  e.preventDefault()
  guardarServicio(e)
})

btnCancelarEliminar.addEventListener('click', cerrarModalEliminar)
btnConfirmarEliminar.addEventListener('click', confirmarEliminar)

// Cerrar modales al hacer clic fuera
modalServicio.addEventListener('click', (e) => {
  if (e.target === modalServicio) {
    cerrarModalServicio()
  }
})

modalEliminar.addEventListener('click', (e) => {
  if (e.target === modalEliminar) {
    cerrarModalEliminar()
  }
})

// Exponer funciones globales para los botones de la tabla
declare global {
  interface Window {
    editarServicio: (id: number) => void
    abrirModalEliminar: (id: number) => void
  }
}

window.editarServicio = abrirModalEditar
window.abrirModalEliminar = abrirModalEliminar

// Inicializar
cargarServicios()
