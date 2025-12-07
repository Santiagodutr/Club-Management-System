import { createClient } from '@supabase/supabase-js'

// Use global EasyMDE from CDN
declare const EasyMDE: any

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY
const BUCKET_NAME = 'salones_imagenes'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

interface ImagenEspacio {
  url: string
  alt: string
  es_portada: boolean
}

interface Disposicion {
  id: number
  nombre: string
  descripcion: string | null
}

interface DisposicionEspacio {
  disposicion_id: number
  nombre: string
  capacidad: number
  tarifas?: {
    socio_4h: number | null
    socio_8h: number | null
    socio_adicional_4h: number | null
    socio_adicional_8h: number | null
    particular_4h: number | null
    particular_8h: number | null
    particular_adicional_4h: number | null
    particular_adicional_8h: number | null
  }
}

let markdownEditor: EasyMDE
let caracteristicas: string[] = []
let servicios: string[] = []
let imagenes: ImagenEspacio[] = []
let disposiciones: Disposicion[] = []
let disposicionesEspacio: DisposicionEspacio[] = []
let disposicionEditandoIndex: number | null = null

async function init() {
  setupMarkdownEditor()
  await cargarDisposiciones()
  setupEventListeners()
}

function setupMarkdownEditor() {
  const editorElement = document.getElementById('markdownEditor')
  if (!editorElement) return

  // Si EasyMDE no está disponible, esperar un poco
  if (typeof EasyMDE === 'undefined') {
    setTimeout(setupMarkdownEditor, 100)
    return
  }

  markdownEditor = new EasyMDE({
    element: editorElement as HTMLTextAreaElement,
    placeholder: 'Escribe la descripción completa del salón...',
    spellChecker: false,
    status: false,
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'unordered-list',
      'ordered-list',
      '|',
      'link',
      'quote',
      '|',
      'preview',
      'guide'
    ]
  })
}

async function cargarDisposiciones() {
  try {
    const response = await fetch('http://localhost:3333/api/disposiciones')
    const result = await response.json()
    disposiciones = result.data || result

    // Llenar select
    const select = document.getElementById('selectDisposicion') as HTMLSelectElement
    if (select) {
      select.innerHTML = '<option value="">Seleccionar...</option>'
      disposiciones.forEach((d) => {
        const option = document.createElement('option')
        option.value = d.id.toString()
        option.textContent = `${d.nombre}${d.descripcion ? ` - ${d.descripcion}` : ''}`
        select.appendChild(option)
      })
    }
  } catch (error) {
    console.error('Error al cargar disposiciones:', error)
  }
}

function setupEventListeners() {
  // Generar slug desde nombre
  const nombreInput = document.getElementById('nombre') as HTMLInputElement
  const slugInput = document.getElementById('slug') as HTMLInputElement
  nombreInput?.addEventListener('input', () => {
    const slug = generateSlug(nombreInput.value)
    if (slugInput) slugInput.value = slug
  })

  // Características
  document.getElementById('btnAgregarCaracteristica')?.addEventListener('click', () => {
    agregarCaracteristica()
  })

  // Servicios
  document.getElementById('btnAgregarServicio')?.addEventListener('click', () => {
    agregarServicio()
  })

  // Disposiciones
  document.getElementById('btnAgregarDisposicion')?.addEventListener('click', (e) => {
    e.preventDefault()
    abrirPopupDisposicion()
  })
  document.getElementById('btnCancelarDisposicion')?.addEventListener('click', (e) => {
    e.preventDefault()
    cerrarPopupDisposicion()
  })
  document.getElementById('btnConfirmarDisposicion')?.addEventListener('click', (e) => {
    e.preventDefault()
    confirmarDisposicion()
  })

  // Modal de Tarifas
  document.getElementById('btnCerrarModalTarifas')?.addEventListener('click', (e) => {
    e.preventDefault()
    cerrarModalTarifas()
  })
  document.getElementById('btnCancelarModalTarifas')?.addEventListener('click', (e) => {
    e.preventDefault()
    cerrarModalTarifas()
  })
  document.getElementById('btnGuardarTarifas')?.addEventListener('click', (e) => {
    e.preventDefault()
    guardarTarifas()
  })

  // Formateo de inputs de moneda
  setupCurrencyInputs()

  // Event delegation para eliminar disposiciones y abrir modal de tarifas
  const disposicionesList = document.getElementById('disposicionesList')
  disposicionesList?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const button = target.closest('[data-action]') as HTMLElement
    if (!button) return

    const action = button.dataset.action
    const index = button.dataset.index

    if (action === 'eliminar-disposicion' && index !== undefined) {
      if (confirm('¿Eliminar esta disposición?')) {
        eliminarDisposicion(parseInt(index))
      }
    }

    if (action === 'configurar-tarifas' && index !== undefined) {
      abrirModalTarifas(parseInt(index))
    }
  })

  // Event delegation para actualizar capacidad de disposiciones
  disposicionesList?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement
    if (target.classList.contains('capacity-input')) {
      const index = parseInt(target.dataset.index || '0')
      let newCapacity = parseInt(target.value)
      
      // Evitar números negativos
      if (newCapacity < 1) {
        target.value = '1'
        newCapacity = 1
      }
      
      if (disposicionesEspacio[index]) {
        disposicionesEspacio[index].capacidad = newCapacity
      }
    }
  })

  // Imágenes
  document.getElementById('btnSubirArchivo')?.addEventListener('click', (e) => {
    e.preventDefault()
    document.getElementById('fileInput')?.click()
  })
  document.getElementById('fileInput')?.addEventListener('change', handleFileUpload)

  const imagenesContainer = document.getElementById('imagenesContainer')
  imagenesContainer?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    // Buscar el botón más cercano si el click fue en un hijo (como SVG o path)
    const button = target.closest('[data-action]') as HTMLElement
    if (!button) return
    
    const action = button.dataset.action
    const index = button.dataset.index

    if (action === 'eliminar-imagen' && index !== undefined) {
      if (confirm('¿Eliminar esta imagen?')) {
        imagenes.splice(parseInt(index), 1)
        // Si eliminamos la portada, marcar la primera como nueva portada
        if (imagenes.length > 0 && !imagenes.find((img) => img.es_portada)) {
          imagenes[0].es_portada = true
        }
        renderImagenes()
      }
    }

    if (action === 'marcar-portada' && index !== undefined) {
      imagenes.forEach((img) => (img.es_portada = false))
      imagenes[parseInt(index)].es_portada = true
      renderImagenes()
    }
  })

  imagenesContainer?.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement
    if (target.classList.contains('imagen-alt-input')) {
      const index = parseInt(target.dataset.index || '0')
      if (imagenes[index]) {
        imagenes[index].alt = target.value
      }
    }
  })

  // Guardar
  const form = document.getElementById('espacioForm')
  form?.addEventListener('submit', (e) => {
    e.preventDefault()
    guardarEspacio()
  })
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function agregarCaracteristica() {
  const texto = prompt('Ingresa la característica:')
  if (!texto?.trim()) return

  caracteristicas.push(texto.trim())
  renderCaracteristicas()
}

function eliminarCaracteristica(index: number) {
  caracteristicas.splice(index, 1)
  renderCaracteristicas()
}

function renderCaracteristicas() {
  const container = document.getElementById('caracteristicasList')
  if (!container) return

  if (caracteristicas.length === 0) {
    container.innerHTML = '<p class="muted">No hay características agregadas</p>'
    return
  }

  container.innerHTML = caracteristicas
    .map(
      (c, i) => `
    <div class="tag-item">
      <span>${c}</span>
      <button type="button" onclick="window.eliminarCaracteristica(${i})" title="Eliminar">&times;</button>
    </div>
  `
    )
    .join('')
}

function agregarServicio() {
  const texto = prompt('Ingresa el servicio incluido:')
  if (!texto?.trim()) return

  servicios.push(texto.trim())
  renderServicios()
}

function eliminarServicio(index: number) {
  servicios.splice(index, 1)
  renderServicios()
}

function renderServicios() {
  const container = document.getElementById('serviciosList')
  if (!container) return

  if (servicios.length === 0) {
    container.innerHTML = '<p class="muted">No hay servicios agregados</p>'
    return
  }

  container.innerHTML = servicios
    .map(
      (s, i) => `
    <div class="tag-item">
      <span>${s}</span>
      <button type="button" onclick="window.eliminarServicio(${i})" title="Eliminar">&times;</button>
    </div>
  `
    )
    .join('')
}

function abrirPopupDisposicion() {
  const popup = document.getElementById('popupDisposicion')
  if (popup) popup.style.display = 'block'
}

function cerrarPopupDisposicion() {
  const popup = document.getElementById('popupDisposicion')
  const select = document.getElementById('selectDisposicion') as HTMLSelectElement
  const input = document.getElementById('inputCapacidad') as HTMLInputElement

  if (popup) popup.style.display = 'none'
  if (select) select.value = ''
  if (input) input.value = ''
}

function confirmarDisposicion() {
  const select = document.getElementById('selectDisposicion') as HTMLSelectElement
  const input = document.getElementById('inputCapacidad') as HTMLInputElement

  const disposicionId = parseInt(select.value)
  const capacidad = parseInt(input.value)

  if (!disposicionId || !capacidad) {
    alert('Selecciona una disposición y capacidad')
    return
  }

  // Verificar que no exista ya
  if (disposicionesEspacio.find((d) => d.disposicion_id === disposicionId)) {
    alert('Esta disposición ya fue agregada')
    return
  }

  const disposicion = disposiciones.find((d) => d.id === disposicionId)
  if (!disposicion) return

  disposicionesEspacio.push({
    disposicion_id: disposicionId,
    nombre: disposicion.nombre,
    capacidad
  })

  renderDisposiciones()
  cerrarPopupDisposicion()
}

function eliminarDisposicion(index: number) {
  disposicionesEspacio.splice(index, 1)
  renderDisposiciones()
}

function formatCurrency(value: string): string {
  // Remover todo excepto dígitos
  const numbers = value.replace(/\D/g, '')
  if (!numbers) return ''
  
  // Formatear con separadores de miles
  return parseInt(numbers).toLocaleString('es-CO')
}

function parseCurrency(value: string): number | null {
  // Remover separadores y convertir a número
  const numbers = value.replace(/\D/g, '')
  return numbers ? parseInt(numbers) : null
}

function setupCurrencyInputs() {
  const currencyInputs = document.querySelectorAll('.currency-input')
  
  currencyInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      const cursorPosition = target.selectionStart || 0
      const oldLength = target.value.length
      
      target.value = formatCurrency(target.value)
      
      // Ajustar posición del cursor después del formateo
      const newLength = target.value.length
      const diff = newLength - oldLength
      target.setSelectionRange(cursorPosition + diff, cursorPosition + diff)
    })
    
    // Formatear al perder foco
    input.addEventListener('blur', (e) => {
      const target = e.target as HTMLInputElement
      target.value = formatCurrency(target.value)
    })
  })
}

function abrirModalTarifas(index: number) {
  disposicionEditandoIndex = index
  const disposicion = disposicionesEspacio[index]
  
  // Llenar valores del modal con las tarifas existentes o dejar vacío
  const tarifas = disposicion.tarifas || {}
  
  ;(document.getElementById('modalTarifaSocio4h') as HTMLInputElement).value = tarifas.socio_4h ? formatCurrency(tarifas.socio_4h.toString()) : ''
  ;(document.getElementById('modalTarifaSocio8h') as HTMLInputElement).value = tarifas.socio_8h ? formatCurrency(tarifas.socio_8h.toString()) : ''
  ;(document.getElementById('modalAdicionalSocio4h') as HTMLInputElement).value = tarifas.socio_adicional_4h ? formatCurrency(tarifas.socio_adicional_4h.toString()) : ''
  ;(document.getElementById('modalAdicionalSocio8h') as HTMLInputElement).value = tarifas.socio_adicional_8h ? formatCurrency(tarifas.socio_adicional_8h.toString()) : ''
  ;(document.getElementById('modalTarifaParticular4h') as HTMLInputElement).value = tarifas.particular_4h ? formatCurrency(tarifas.particular_4h.toString()) : ''
  ;(document.getElementById('modalTarifaParticular8h') as HTMLInputElement).value = tarifas.particular_8h ? formatCurrency(tarifas.particular_8h.toString()) : ''
  ;(document.getElementById('modalAdicionalParticular4h') as HTMLInputElement).value = tarifas.particular_adicional_4h ? formatCurrency(tarifas.particular_adicional_4h.toString()) : ''
  ;(document.getElementById('modalAdicionalParticular8h') as HTMLInputElement).value = tarifas.particular_adicional_8h ? formatCurrency(tarifas.particular_adicional_8h.toString()) : ''
  
  const modal = document.getElementById('modalTarifas')
  if (modal) modal.style.display = 'flex'
}

function cerrarModalTarifas() {
  disposicionEditandoIndex = null
  const modal = document.getElementById('modalTarifas')
  if (modal) modal.style.display = 'none'
}

function guardarTarifas() {
  if (disposicionEditandoIndex === null) return
  
  const socio4h = parseCurrency((document.getElementById('modalTarifaSocio4h') as HTMLInputElement).value)
  const socio8h = parseCurrency((document.getElementById('modalTarifaSocio8h') as HTMLInputElement).value)
  const socioAdicional4h = parseCurrency((document.getElementById('modalAdicionalSocio4h') as HTMLInputElement).value)
  const socioAdicional8h = parseCurrency((document.getElementById('modalAdicionalSocio8h') as HTMLInputElement).value)
  const particular4h = parseCurrency((document.getElementById('modalTarifaParticular4h') as HTMLInputElement).value)
  const particular8h = parseCurrency((document.getElementById('modalTarifaParticular8h') as HTMLInputElement).value)
  const particularAdicional4h = parseCurrency((document.getElementById('modalAdicionalParticular4h') as HTMLInputElement).value)
  const particularAdicional8h = parseCurrency((document.getElementById('modalAdicionalParticular8h') as HTMLInputElement).value)
  
  disposicionesEspacio[disposicionEditandoIndex].tarifas = {
    socio_4h: socio4h,
    socio_8h: socio8h,
    socio_adicional_4h: socioAdicional4h,
    socio_adicional_8h: socioAdicional8h,
    particular_4h: particular4h,
    particular_8h: particular8h,
    particular_adicional_4h: particularAdicional4h,
    particular_adicional_8h: particularAdicional8h
  }
  
  renderDisposiciones()
  cerrarModalTarifas()
}

function renderDisposiciones() {
  const container = document.getElementById('disposicionesList')
  if (!container) return

  if (disposicionesEspacio.length === 0) {
    container.innerHTML = '<div class="placeholder">No hay disposiciones configuradas</div>'
    return
  }

  container.innerHTML = disposicionesEspacio
    .map(
      (d, i) => {
        const tieneTarifas = d.tarifas && Object.values(d.tarifas).some(v => v !== null && v !== undefined)
        return `
    <div class="config-card">
      <div class="config-info">
        <span class="config-title">${d.nombre}</span>
        <div class="config-capacity-input">
          <label>Capacidad:</label>
          <input type="number" class="capacity-input" value="${d.capacidad}" data-index="${i}" min="1" />
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <button type="button" class="btn-tarifa ${tieneTarifas ? 'has-rates' : ''}" data-action="configurar-tarifas" data-index="${i}" title="Configurar tarifas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </button>
        <button type="button" class="btn-icon danger" data-action="eliminar-disposicion" data-index="${i}" title="Eliminar">
          ✕
        </button>
      </div>
    </div>
  `
      }
    )
    .join('')
}

async function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files || files.length === 0) return

  const uploadProgress = document.getElementById('uploadProgress') as HTMLElement
  const progressBar = document.getElementById('progressBar') as HTMLElement
  const progressText = document.getElementById('progressText') as HTMLElement

  uploadProgress.style.display = 'block'

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      progressText.textContent = `Subiendo ${i + 1} de ${files.length}...`

      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const extension = file.name.split('.').pop()
      const fileName = `espacio_${timestamp}_${randomStr}.${extension}`

      const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

      if (error) {
        console.error('Error subiendo archivo:', error)
        continue
      }

      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

      if (urlData?.publicUrl) {
        imagenes.push({
          url: urlData.publicUrl,
          alt: file.name.replace(/\.[^/.]+$/, ''),
          es_portada: imagenes.length === 0 // Primera imagen es portada
        })
      }

      const progress = ((i + 1) / files.length) * 100
      progressBar.style.width = `${progress}%`
    }

    progressText.textContent = `${files.length} archivos subidos correctamente`
    setTimeout(() => {
      uploadProgress.style.display = 'none'
      progressBar.style.width = '0%'
    }, 2000)

    renderImagenes()
  } catch (error) {
    console.error('Error en subida de archivos:', error)
    uploadProgress.style.display = 'none'
  }

  input.value = ''
}

function renderImagenes() {
  const container = document.getElementById('imagenesContainer')
  if (!container) return

  if (imagenes.length === 0) {
    container.innerHTML = '<div class="placeholder">No hay imágenes. Sube archivos para comenzar.</div>'
    return
  }

  container.innerHTML = imagenes
    .map(
      (img, index) => `
    <div class="imagen-item ${img.es_portada ? 'is-portada' : ''}">
      <img src="${img.url}" alt="${img.alt || 'Imagen'}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"140\" height=\"105\" viewBox=\"0 0 140 105\"%3E%3Crect fill=\"%23fee2e2\" width=\"140\" height=\"105\"/%3E%3Ctext x=\"70\" y=\"55\" font-family=\"Arial\" font-size=\"14\" fill=\"%23ef4444\" text-anchor=\"middle\"%3EError%3C/text%3E%3C/svg%3E'" />
      <div class="imagen-actions">
        ${!img.es_portada ? `<button type="button" class="btn-icon primary" data-action="marcar-portada" data-index="${index}" title="Marcar como portada">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>` : ''}
        <button type="button" class="btn-icon danger" data-action="eliminar-imagen" data-index="${index}" title="Eliminar imagen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        </button>
      </div>
      <input 
        type="text" 
        value="${img.alt || ''}" 
        placeholder="Descripción de la imagen..."
        data-index="${index}"
        class="imagen-alt-input"
      />
    </div>
  `
    )
    .join('')
}

async function guardarEspacio() {
  const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim()
  if (!nombre) {
    alert('El nombre es obligatorio')
    return
  }

  const capacidadMaxInput = document.getElementById('capacidadMaxima') as HTMLInputElement
  const capacidadMaxValue = capacidadMaxInput?.value?.trim()
  
  const datos: any = {
    nombre,
    slug: (document.getElementById('slug') as HTMLInputElement).value.trim(),
    subtitulo: (document.getElementById('subtitulo') as HTMLInputElement).value.trim() || null,
    descripcion_completa: (markdownEditor && markdownEditor.value()) || null,
    capacidad_minima: 0,
    capacidad_maxima: capacidadMaxValue && capacidadMaxValue !== '' ? parseInt(capacidadMaxValue) : null,
    area_m2: parseFloat((document.getElementById('areaM2') as HTMLInputElement).value) || null,
    caracteristicas: caracteristicas.length > 0 ? caracteristicas : null,
    servicios_incluidos: servicios.length > 0 ? servicios : null,
    imagenes: imagenes.length > 0 ? imagenes : null,
    destacado: (document.getElementById('destacado') as HTMLInputElement).checked,
    activo: (document.getElementById('activo') as HTMLInputElement).checked
  }

  console.log('[DEBUG] Capacidad máxima capturada:', capacidadMaxValue, '-> parsed:', datos.capacidad_maxima)

  console.log('[DEBUG] Datos a enviar:', datos)

  try {
    // Usar getFreshToken en lugar de getSession directo
    const { getFreshToken } = await import('../../auth')
    const token = await getFreshToken()
    
    if (!token) {
      alert('Sesión expirada. Por favor, inicia sesión nuevamente.')
      window.location.href = '/admin/login'
      return
    }
    
    const response = await fetch('http://localhost:3333/api/espacios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(datos)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Error al crear espacio:', response.status, errorData)
      alert(`Error al crear espacio: ${errorData.message || 'Error desconocido'}`)
      return
    }

    const espacioCreado = await response.json()
    console.log('Espacio creado:', espacioCreado)
    const espacioId = espacioCreado.data?.id || espacioCreado.id

    if (!espacioId) {
      console.error('No se obtuvo ID del espacio creado:', espacioCreado)
      alert('Error: No se obtuvo el ID del espacio creado')
      return
    }

    // Crear configuraciones y tarifas si hay disposiciones
    if (disposicionesEspacio.length > 0) {
      await crearConfiguraciones(espacioId)
    }

    // Marcar que hay cambios sin publicar
    localStorage.setItem('hayCambiosSinPublicar', 'true')

    alert('Espacio creado exitosamente. Recuerda publicar los cambios cuando estés listo.')
    window.location.href = '/admin/espacios'
  } catch (error) {
    console.error('Error al crear espacio:', error)
    alert(`Error al crear el espacio: ${error}`)
  }
}

async function crearConfiguraciones(espacioId: number) {
  // Obtener token fresco antes de crear configuraciones
  const { getFreshToken } = await import('../../auth')
  const token = await getFreshToken()
  
  if (!token) {
    console.error('No se pudo obtener token para crear configuraciones')
    return
  }

  for (const disp of disposicionesEspacio) {
    try {
      // Crear configuración con tarifas
      const payload: any = {
        disposicionId: disp.disposicion_id,
        capacidad: disp.capacidad
      }

      // Agregar tarifas si existen
      if (disp.tarifas) {
        payload.tarifas = disp.tarifas
      }

      const configResponse = await fetch(`http://localhost:3333/admin/espacios/${espacioId}/configuraciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!configResponse.ok) {
        const errorData = await configResponse.json().catch(() => ({}))
        console.error('Error creando configuración:', configResponse.status, errorData)
        alert(`Error al crear configuración para ${disp.nombre}: ${errorData.message || 'Error desconocido'}`)
        continue
      }

      const result = await configResponse.json()
      console.log('Configuración creada:', result)

    } catch (error) {
      console.error('Error creando configuración:', error)
      alert(`Error al crear configuración: ${error}`)
    }
  }
}

// Exponer funciones globales para onclick
;(window as any).eliminarCaracteristica = eliminarCaracteristica
;(window as any).eliminarServicio = eliminarServicio

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
