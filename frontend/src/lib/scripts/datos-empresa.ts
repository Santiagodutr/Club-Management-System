import { supabase } from '../../lib/supabase'
import { datosEmpresaAPI, type DatosEmpresa } from '../../services/api'

let modoEdicion = false
let datosOriginales: any = null

// Verificar sesión
async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    window.location.href = '/admin/login'
  }
}

// Helper para mostrar mensajes
function showMessage(type: 'success' | 'error', message?: string) {
  const mensajeConfirmacion = document.getElementById('mensajeConfirmacion')
  const mensajeError = document.getElementById('mensajeError')
  const mensajeErrorTexto = document.getElementById('mensajeErrorTexto')

  if (type === 'success' && mensajeConfirmacion) {
    mensajeConfirmacion.classList.remove('hidden')
    setTimeout(() => {
      mensajeConfirmacion.classList.add('hidden')
    }, 3000)
  } else if (type === 'error' && mensajeError && mensajeErrorTexto) {
    if (message) {
      mensajeErrorTexto.textContent = message
    }
    mensajeError.classList.remove('hidden')
    setTimeout(() => {
      mensajeError.classList.add('hidden')
    }, 5000)
  }
}

function activarModoEdicion() {
  modoEdicion = true
  
  // Ocultar displays y mostrar inputs
  document.querySelectorAll('.field-display').forEach(el => {
    ;(el as HTMLElement).style.display = 'none'
  })
  
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#nit, #bancolombiaCc, #daviviendaCc, #daviviendaCa, #direccion, #emailGerente, #whatsappGerente').forEach(el => {
    el.style.display = 'block'
    el.disabled = false
  })
  
  const whatsappInput = document.getElementById('whatsappGerenteInput') as HTMLElement
  if (whatsappInput) {
    whatsappInput.style.display = 'flex'
  }
  
  // Mostrar botones de guardar y cancelar, ocultar editar
  const btnEditar = document.getElementById('btnEditar') as HTMLButtonElement
  const btnGuardar = document.getElementById('btnGuardarCambios') as HTMLButtonElement
  const btnCancelar = document.getElementById('btnCancelar') as HTMLButtonElement
  
  if (btnEditar) btnEditar.style.display = 'none'
  if (btnGuardar) btnGuardar.style.display = 'inline-block'
  if (btnCancelar) btnCancelar.style.display = 'inline-block'
}

function desactivarModoEdicion() {
  modoEdicion = false
  
  // Mostrar displays y ocultar inputs
  actualizarDisplays()
  
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#nit, #bancolombiaCc, #daviviendaCc, #daviviendaCa, #direccion, #emailGerente, #whatsappGerente').forEach(el => {
    el.style.display = 'none'
    el.disabled = true
  })
  
  const whatsappInput = document.getElementById('whatsappGerenteInput') as HTMLElement
  if (whatsappInput) {
    whatsappInput.style.display = 'none'
  }
  
  // Mostrar botón editar, ocultar guardar y cancelar
  const btnEditar = document.getElementById('btnEditar') as HTMLButtonElement
  const btnGuardar = document.getElementById('btnGuardarCambios') as HTMLButtonElement
  const btnCancelar = document.getElementById('btnCancelar') as HTMLButtonElement
  
  if (btnEditar) btnEditar.style.display = 'inline-block'
  if (btnGuardar) btnGuardar.style.display = 'none'
  if (btnCancelar) btnCancelar.style.display = 'none'
}

function actualizarDisplays() {
  const fields = [
    { input: 'nit', display: 'nitDisplay' },
    { input: 'bancolombiaCc', display: 'bancolombiaCcDisplay' },
    { input: 'daviviendaCc', display: 'daviviendaCcDisplay' },
    { input: 'daviviendaCa', display: 'daviviendaCaDisplay' },
    { input: 'direccion', display: 'direccionDisplay' },
    { input: 'emailGerente', display: 'emailGerenteDisplay' },
  ]
  
  fields.forEach(({ input, display }) => {
    const inputEl = document.getElementById(input) as HTMLInputElement | HTMLTextAreaElement
    const displayEl = document.getElementById(display) as HTMLElement
    
    if (inputEl && displayEl) {
      displayEl.textContent = inputEl.value || ''
      displayEl.style.display = 'flex'
    }
  })
  
  // WhatsApp especial
  const whatsappInput = document.getElementById('whatsappGerente') as HTMLInputElement
  const whatsappDisplay = document.getElementById('whatsappGerenteDisplay') as HTMLElement
  
  if (whatsappInput && whatsappDisplay) {
    const valor = whatsappInput.value
    whatsappDisplay.textContent = valor ? `+57 ${valor}` : ''
    whatsappDisplay.style.display = 'flex'
  }
}

function cancelarEdicion() {
  if (datosOriginales) {
    cargarDatosEnFormulario(datosOriginales)
  }
  desactivarModoEdicion()
}

function cargarDatosEnFormulario(datos: any) {
  const nit = document.getElementById('nit') as HTMLInputElement
  const bancolombiaCc = document.getElementById('bancolombiaCc') as HTMLInputElement
  const daviviendaCc = document.getElementById('daviviendaCc') as HTMLInputElement
  const daviviendaCa = document.getElementById('daviviendaCa') as HTMLInputElement
  const direccion = document.getElementById('direccion') as HTMLTextAreaElement
  const emailGerente = document.getElementById('emailGerente') as HTMLInputElement
  const whatsappGerente = document.getElementById('whatsappGerente') as HTMLInputElement
  
  if (nit) nit.value = datos.nit || ''
  if (bancolombiaCc) bancolombiaCc.value = datos.bancolombia_cc || ''
  if (daviviendaCc) daviviendaCc.value = datos.davivienda_cc || ''
  if (daviviendaCa) daviviendaCa.value = datos.davivienda_ca || ''
  if (direccion) direccion.value = datos.direccion || ''
  if (emailGerente) emailGerente.value = datos.emailGerente || ''
  
  // Para WhatsApp, mostrar solo después del código de país 57
  if (whatsappGerente) {
    const whatsapp = datos.whatsappGerente || ''
    whatsappGerente.value = whatsapp.startsWith('57') ? whatsapp.substring(2) : whatsapp
  }
  
  actualizarDisplays()
}

// Cargar datos de la empresa
async function cargarDatos() {
  try {
    const response = await datosEmpresaAPI.obtener()
    
    if (response.success && response.data) {
      datosOriginales = response.data
      cargarDatosEnFormulario(response.data)
    }
  } catch (error) {
    console.error('Error cargando datos:', error)
    showMessage('error', 'Error al cargar los datos de la empresa')
  }
}

// Guardar cambios
async function guardarCambios() {
  const btnGuardar = document.getElementById('btnGuardarCambios') as HTMLButtonElement
  
  if (!btnGuardar) return
  
  try {
    btnGuardar.disabled = true
    btnGuardar.textContent = 'Guardando...'
    
    // Recoger los valores del formulario
    const nit = (document.getElementById('nit') as HTMLInputElement)?.value
    const bancolombiaCc = (document.getElementById('bancolombiaCc') as HTMLInputElement)?.value
    const daviviendaCc = (document.getElementById('daviviendaCc') as HTMLInputElement)?.value
    const daviviendaCa = (document.getElementById('daviviendaCa') as HTMLInputElement)?.value
    const direccion = (document.getElementById('direccion') as HTMLTextAreaElement)?.value
    const emailGerente = (document.getElementById('emailGerente') as HTMLInputElement)?.value
    const whatsappGerente = (document.getElementById('whatsappGerente') as HTMLInputElement)?.value
    
    // Validar NIT (obligatorio)
    if (!nit || nit.trim() === '') {
      showMessage('error', 'El NIT es obligatorio')
      btnGuardar.disabled = false
      btnGuardar.textContent = 'Guardar Cambios'
      return
    }
    
    // Preparar datos para enviar
    // Para WhatsApp, agregar el prefijo 57 si no lo tiene
    let whatsappCompleto = whatsappGerente?.trim() || null
    if (whatsappCompleto && !whatsappCompleto.startsWith('57')) {
      whatsappCompleto = '57' + whatsappCompleto
    }
    
    const datosActualizados = {
      nit: nit.trim(),
      bancolombia_cc: bancolombiaCc?.trim() || null,
      davivienda_cc: daviviendaCc?.trim() || null,
      davivienda_ca: daviviendaCa?.trim() || null,
      direccion: direccion?.trim() || null,
      email_gerente: emailGerente?.trim() || null,
      whatsapp_gerente: whatsappCompleto,
    }
    
    const response = await datosEmpresaAPI.actualizar(datosActualizados)
    
    if (response.success) {
      showMessage('success')
      datosOriginales = response.data
      desactivarModoEdicion()
    }
  } catch (error: any) {
    console.error('Error guardando cambios:', error)
    showMessage('error', error.message || 'Error al guardar los cambios')
  } finally {
    btnGuardar.disabled = false
    btnGuardar.textContent = 'Guardar Cambios'
  }
}

// Inicialización
async function init() {
  await ensureSession()
  await cargarDatos()
  
  // Event listeners
  const btnEditar = document.getElementById('btnEditar')
  const btnGuardar = document.getElementById('btnGuardarCambios')
  const btnCancelar = document.getElementById('btnCancelar')
  
  if (btnEditar) {
    btnEditar.addEventListener('click', activarModoEdicion)
  }
  
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarCambios)
  }
  
  if (btnCancelar) {
    btnCancelar.addEventListener('click', cancelarEdicion)
  }
}

// Ejecutar al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
