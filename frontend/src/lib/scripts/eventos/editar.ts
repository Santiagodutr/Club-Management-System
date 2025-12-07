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
  content: string
  imagenes: Imagen[] | null
  publicado: boolean
}

// Obtener ID del evento de la URL inmediatamente
const pathParts = window.location.pathname.split('/')
const idIndex = pathParts.indexOf('eventos') + 1
let eventoId: number | null = null
if (idIndex > 0 && pathParts[idIndex]) {
  eventoId = parseInt(pathParts[idIndex])
}

let imagenesTemp: Imagen[] = []
let espacios: any[] = []
let editor: any = null

// Función para obtener elementos del DOM de forma segura
const getElement = <T extends HTMLElement>(id: string): T | null => {
  return document.getElementById(id) as T | null
}

const waitForElement = (id: string, timeout = 5000): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    const el = getElement(id)
    if (el) return resolve(el)
    
    const observer = new MutationObserver(() => {
      const el = getElement(id)
      if (el) {
        observer.disconnect()
        resolve(el)
      }
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    setTimeout(() => {
      observer.disconnect()
      reject(new Error(`Element ${id} not found`))
    }, timeout)
  })
}

// Iniciar inmediatamente si el DOM ya está listo, sino esperar
const initWhenReady = (callback: () => void) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback)
  } else {
    callback()
  }
}

initWhenReady(() => {

  // Funciones auxiliares
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
        renderEspaciosSelect()
      }
    } catch (error) {
      console.error('Error cargando espacios:', error)
    }
  }

  function renderEspaciosSelect(selectedId?: number | null) {
    const eventoEspacio = getElement<HTMLSelectElement>('eventoEspacio')
    if (!eventoEspacio) return
    eventoEspacio.innerHTML = '<option value="">Ninguno</option>'
    espacios.forEach(espacio => {
      const option = document.createElement('option')
      option.value = espacio.id
      option.textContent = espacio.nombre
      if (selectedId && espacio.id === selectedId) {
        option.selected = true
      }
      eventoEspacio.appendChild(option)
    })
  }

  // Cargar evento existente
  async function cargarEvento() {
    if (!eventoId) {
      showNotification('ID de evento no válido', 'error')
      window.location.href = '/admin/eventos'
      return
    }

    try {
      const token = getAuthToken()
      
      // Cargar espacios y evento en paralelo
      const [eventoResponse, espaciosResponse] = await Promise.all([
        fetch(`${API_URL}/admin/salon-posts/${eventoId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/espacios`)
      ])
      
      const [eventoResult, espaciosResult] = await Promise.all([
        eventoResponse.json(),
        espaciosResponse.json()
      ])
      
      // Cargar espacios
      if (espaciosResult.success) {
        espacios = espaciosResult.data
        renderEspaciosSelect()
      }
      
      // Llenar formulario con datos del evento
      if (eventoResult.success && eventoResult.data) {
        const evento: Evento = eventoResult.data
        
        const eventoTitulo = getElement<HTMLInputElement>('eventoTitulo')
        const pageTitle = getElement('pageTitle')
        const eventoEspacio = getElement<HTMLSelectElement>('eventoEspacio')
        const loadingState = getElement('loadingState')
        const eventoFormSection = getElement('eventoForm')
        
        if (eventoTitulo) eventoTitulo.value = evento.titulo
        if (pageTitle) pageTitle.textContent = `Editar: ${evento.titulo}`
        
        if (eventoEspacio && evento.espacioId) {
          eventoEspacio.value = evento.espacioId.toString()
        }
        
        if (evento.imagenes && Array.isArray(evento.imagenes)) {
          imagenesTemp = [...evento.imagenes]
          renderImagenes()
        }
        
        // Cargar contenido en el editor
        if (editor && evento.content) {
          editor.value(evento.content)
          // Forzar refresh del CodeMirror para que se muestre correctamente
          setTimeout(() => {
            if (editor && editor.codemirror) {
              editor.codemirror.refresh()
              editor.codemirror.focus()
            }
          }, 50)
        }
        
        if (loadingState) loadingState.style.display = 'none'
        if (eventoFormSection) eventoFormSection.style.display = 'block'
        
      } else {
        showNotification('Evento no encontrado', 'error')
        setTimeout(() => {
          window.location.href = '/admin/eventos'
        }, 2000)
      }
    } catch (error) {
      console.error('Error cargando evento:', error)
      showNotification('Error al cargar evento', 'error')
      setTimeout(() => {
        window.location.href = '/admin/eventos'
      }, 2000)
    }
  }

  // Renderizar imágenes
  function renderImagenes() {
    const imagenesContainer = getElement('imagenesContainer')
    if (!imagenesContainer) return
    
    if (imagenesTemp.length === 0) {
      imagenesContainer.innerHTML = '<div class="placeholder">No hay imágenes. Sube archivos para comenzar.</div>'
      return
    }
    
    imagenesContainer.innerHTML = imagenesTemp.map((img, index) => `
      <div class="imagen-item">
        <img src="${img.url}" alt="${img.alt || 'Imagen'}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"140\" height=\"105\" viewBox=\"0 0 140 105\"%3E%3Crect fill=\"%23fee2e2\" width=\"140\" height=\"105\"/%3E%3Ctext x=\"70\" y=\"55\" font-family=\"Arial\" font-size=\"14\" fill=\"%23ef4444\" text-anchor=\"middle\"%3EError%3C/text%3E%3C/svg%3E'" />
        <input 
          type="text" 
          value="${img.alt || ''}" 
          placeholder="Descripción..."
          data-index="${index}"
          class="imagen-alt-input"
        />
        <div class="imagen-overlay">
          <div class="imagen-actions">
            <button type="button" class="btn-icon danger" data-action="eliminar-imagen" data-index="${index}">Eliminar</button>
          </div>
        </div>
      </div>
    `).join('')
  }

  // Subir archivos a Supabase Storage
  async function subirArchivos(files: FileList) {
    const uploadProgress = getElement('uploadProgress')
    const progressBar = getElement('progressBar')
    const progressText = getElement('progressText')
    if (!uploadProgress || !progressBar || !progressText) return
    
    uploadProgress.style.display = 'block'
    const totalFiles = files.length
    let uploadedCount = 0
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (progressText) progressText.textContent = `Subiendo ${i + 1} de ${totalFiles}...`
        
        // Generar nombre único
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const extension = file.name.split('.').pop()
        const fileName = `evento_${timestamp}_${randomStr}.${extension}`
        
        // Subir a Supabase Storage
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })
        
        if (error) {
          console.error('Error subiendo archivo:', error)
          showNotification(`Error subiendo ${file.name}`, 'error')
          continue
        }
        
        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName)
        
        if (urlData?.publicUrl) {
          imagenesTemp.push({
            url: urlData.publicUrl,
            alt: file.name.replace(/\.[^/.]+$/, '')
          })
          uploadedCount++
        }
        
        // Actualizar barra de progreso
        const progress = ((i + 1) / totalFiles) * 100
        if (progressBar) progressBar.style.width = `${progress}%`
      }
      
      if (progressText) progressText.textContent = `${uploadedCount} de ${totalFiles} archivos subidos correctamente`
      setTimeout(() => {
        if (uploadProgress) (uploadProgress as HTMLElement).style.display = 'none'
        if (progressBar) progressBar.style.width = '0%'
      }, 2000)
      
      renderImagenes()
      showNotification(`${uploadedCount} imágenes subidas exitosamente`)
      
    } catch (error) {
      console.error('Error en subida de archivos:', error)
      showNotification('Error al subir archivos', 'error')
      if (uploadProgress) (uploadProgress as HTMLElement).style.display = 'none'
    }
  }

  // Actualizar evento
  async function actualizarEvento(e: Event) {
    e.preventDefault()
    
    if (!eventoId) {
      showNotification('ID de evento no válido', 'error')
      return
    }
    
    const eventoTitulo = getElement<HTMLInputElement>('eventoTitulo')
    const eventoEspacio = getElement<HTMLSelectElement>('eventoEspacio')
    
    const titulo = eventoTitulo?.value.trim() || ''
    const content = editor ? editor.value().trim() : ''
    
    if (!titulo || !content) {
      showNotification('Completa los campos obligatorios (título, contenido)', 'error')
      return
    }
    
    const payload = {
      titulo,
      espacioId: eventoEspacio?.value ? parseInt(eventoEspacio.value) : null,
      content,
      imagenes: imagenesTemp.length > 0 ? imagenesTemp : null,
      publicado: true,
    }
    
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/admin/salon-posts/${eventoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      
      const result = await response.json()
      
      if (result.success) {
        showNotification('Evento actualizado exitosamente')
        setTimeout(() => {
          window.location.href = '/admin/eventos'
        }, 1500)
      } else {
        showNotification(result.message || 'Error al actualizar', 'error')
      }
    } catch (error) {
      console.error('Error actualizando evento:', error)
      showNotification('Error de conexión', 'error')
    }
  }

  // Event listeners
  const btnSubirArchivo = getElement('btnSubirArchivo')
  const fileInput = getElement<HTMLInputElement>('fileInput')
  const imagenesContainer = getElement('imagenesContainer')
  const eventoFormSection = getElement('eventoForm')
  const eventoForm = eventoFormSection?.querySelector('form') as HTMLFormElement
  
  btnSubirArchivo?.addEventListener('click', (e) => {
    e.preventDefault()
    fileInput?.click()
  })

  fileInput?.addEventListener('change', (e) => {
    const files = (e.target as HTMLInputElement).files
    if (files && files.length > 0) {
      subirArchivos(files)
    }
  })

  imagenesContainer?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const action = target.dataset.action
    const index = target.dataset.index
    
    if (action === 'eliminar-imagen' && index !== undefined) {
      if (confirm('¿Eliminar esta imagen?')) {
        imagenesTemp.splice(parseInt(index), 1)
        renderImagenes()
      }
    }
  })

  imagenesContainer?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement
    if (target.classList.contains('imagen-alt-input')) {
      const index = parseInt(target.dataset.index || '0')
      if (imagenesTemp[index]) {
        imagenesTemp[index].alt = target.value
      }
    }
  })

  eventoForm?.addEventListener('submit', actualizarEvento)

  // Galería de imágenes existentes
  const btnVerGaleria = getElement('btnVerGaleria')
  const modalGaleria = getElement('modalGaleria')
  const btnCerrarGaleria = getElement('btnCerrarGaleria')
  const btnCancelarGaleria = getElement('btnCancelarGaleria')
  const btnAgregarSeleccionadas = getElement('btnAgregarSeleccionadas')
  const galeriaLoading = getElement('galeriaLoading')
  const galeriaGrid = getElement('galeriaGrid')

  let imagenesGaleria: any[] = []
  let seleccionadas: Set<string> = new Set()

  async function cargarGaleria() {
    if (!galeriaLoading || !galeriaGrid) return
    
    galeriaLoading.style.display = 'block'
    galeriaGrid.style.display = 'none'
    seleccionadas.clear()

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      imagenesGaleria = (data || []).filter(img => img.name !== '.emptyFolderPlaceholder')
      
      if (imagenesGaleria.length === 0) {
        galeriaLoading.textContent = 'No hay imágenes en la galería.'
        return
      }

      galeriaLoading.style.display = 'none'
      galeriaGrid.style.display = 'grid'
      
      galeriaGrid.innerHTML = imagenesGaleria.map(img => {
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(img.name)
        
        return `
          <div class="galeria-item" data-name="${img.name}" data-url="${publicUrl}">
            <img src="${publicUrl}" alt="${img.name}" />
            <div class="check-mark">✓</div>
            <div class="image-name">${img.name}</div>
          </div>
        `
      }).join('')

      // Event listeners para selección
      galeriaGrid.querySelectorAll('.galeria-item').forEach(item => {
        item.addEventListener('click', () => {
          const name = item.getAttribute('data-name') || ''
          if (seleccionadas.has(name)) {
            seleccionadas.delete(name)
            item.classList.remove('selected')
          } else {
            seleccionadas.add(name)
            item.classList.add('selected')
          }
        })
      })

    } catch (error: any) {
      console.error('Error cargando galería:', error)
      galeriaLoading.textContent = 'Error al cargar la galería.'
      showNotification('Error al cargar la galería', 'error')
    }
  }

  function abrirGaleria() {
    if (modalGaleria) {
      modalGaleria.style.display = 'flex'
      cargarGaleria()
    }
  }

  function cerrarGaleria() {
    if (modalGaleria) {
      modalGaleria.style.display = 'none'
      seleccionadas.clear()
    }
  }

  function agregarImagenesSeleccionadas() {
    const imagenes = Array.from(seleccionadas).map(name => {
      const item = galeriaGrid?.querySelector(`[data-name="${name}"]`)
      const url = item?.getAttribute('data-url') || ''
      return { url, alt: name }
    })

    imagenesTemp.push(...imagenes)
    renderImagenes()
    cerrarGaleria()
    showNotification(`${imagenes.length} imagen(es) agregada(s)`, 'success')
  }

  // Event listeners para galería
  btnVerGaleria?.addEventListener('click', abrirGaleria)
  btnCerrarGaleria?.addEventListener('click', cerrarGaleria)
  btnCancelarGaleria?.addEventListener('click', cerrarGaleria)
  btnAgregarSeleccionadas?.addEventListener('click', agregarImagenesSeleccionadas)
  
  modalGaleria?.addEventListener('click', (e) => {
    if (e.target === modalGaleria) {
      cerrarGaleria()
    }
  })

  // Inicializar editor EasyMDE
  function initEditor() {
    const textarea = document.createElement('textarea')
    textarea.id = 'eventoContent'
    const container = document.getElementById('editorContainer')
    if (container) {
      container.appendChild(textarea)
      
      // @ts-ignore
      editor = new EasyMDE({
        element: textarea,
        placeholder: '# Contenido del evento\n\nEscribe aquí en **Markdown**...',
        spellChecker: false,
        status: ['lines', 'words', 'cursor'],
        toolbar: [
          'bold', 'italic', 'heading', '|',
          'quote', 'unordered-list', 'ordered-list', '|',
          'link', 'image', '|',
          'preview', 'side-by-side', 'fullscreen', '|',
          'guide'
        ],
        minHeight: '300px',
        autofocus: false,
        initialValue: '',
      })
      
      // Forzar refresh del editor para que se renderice correctamente
      setTimeout(() => {
        if (editor) {
          editor.codemirror.refresh()
        }
      }, 100)
    }
  }

  // Inicializar
  async function init() {
    // Inicializar editor y cargar datos en paralelo
    const checkEasyMDE = () => {
      // @ts-ignore
      if (typeof EasyMDE !== 'undefined') {
        initEditor()
        cargarEvento()
        return true
      }
      return false
    }
    
    // Intentar inmediatamente
    if (!checkEasyMDE()) {
      // Si no está disponible, esperar
      const interval = setInterval(() => {
        if (checkEasyMDE()) {
          clearInterval(interval)
        }
      }, 50)
      
      // Timeout de seguridad
      setTimeout(() => {
        clearInterval(interval)
        // @ts-ignore
        if (typeof EasyMDE === 'undefined') {
          showNotification('Error cargando el editor', 'error')
        }
      }, 5000)
    }
  }

  init()
})
