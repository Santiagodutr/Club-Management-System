import { supabase } from '../../lib/supabase'
import { datosEmpresaAPI, type DatosEmpresa } from '../../services/api'

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

// Helper para marcar campos como modificados
function markAsChanged(element: HTMLInputElement | HTMLTextAreaElement) {
  element.classList.add('changed')
  const card = element.closest('.card')
  if (card) {
    card.classList.add('changed')
  }
  
  const btnGuardar = document.getElementById('btnGuardarCambios')
  if (btnGuardar) {
    btnGuardar.style.display = 'inline-block'
  }
}

// Helper para limpiar marcas de cambios
function clearChangedMarks() {
  document.querySelectorAll('.changed').forEach(el => {
    el.classList.remove('changed')
  })
  
  const btnGuardar = document.getElementById('btnGuardarCambios')
  if (btnGuardar) {
    btnGuardar.style.display = 'none'
  }
}

// Cargar datos de la empresa
async function cargarDatos() {
  try {
    const response = await datosEmpresaAPI.obtener()
    
    if (response.success && response.data) {
      const datos = response.data
      
      // Llenar los campos del formulario
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
      
      // Guardar valores originales para detectar cambios
      if (nit) nit.dataset.original = nit.value
      if (bancolombiaCc) bancolombiaCc.dataset.original = bancolombiaCc.value
      if (daviviendaCc) daviviendaCc.dataset.original = daviviendaCc.value
      if (daviviendaCa) daviviendaCa.dataset.original = daviviendaCa.value
      if (direccion) direccion.dataset.original = direccion.value
      if (emailGerente) emailGerente.dataset.original = emailGerente.value
      if (whatsappGerente) {
        whatsappGerente.dataset.original = whatsappGerente.value
        // Guardar también el valor completo original para comparación
        whatsappGerente.dataset.originalFull = datos.whatsappGerente || ''
      }
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
      clearChangedMarks()
      
      // Actualizar valores originales
      const inputs = document.querySelectorAll('input, textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>
      inputs.forEach(input => {
        input.dataset.original = input.value
      })
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
  
  // Event listeners para detectar cambios en los campos
  const inputs = document.querySelectorAll('input, textarea') as NodeListOf<HTMLInputElement | HTMLTextAreaElement>
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (input.value !== input.dataset.original) {
        markAsChanged(input)
      } else {
        input.classList.remove('changed')
        
        // Verificar si todavía hay cambios en algún campo
        const hayCambios = Array.from(inputs).some(inp => inp.value !== inp.dataset.original)
        if (!hayCambios) {
          clearChangedMarks()
        }
      }
    })
  })
  
  // Event listener para el botón de guardar
  const btnGuardar = document.getElementById('btnGuardarCambios')
  if (btnGuardar) {
    btnGuardar.addEventListener('click', guardarCambios)
  }
}

// Ejecutar al cargar la página
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
