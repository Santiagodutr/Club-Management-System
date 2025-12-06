import { espaciosAdminAPI, salonPostsAPI, type SalonPost } from '../../services/api'
import { supabase } from '../../lib/supabase'

type Maybe<T> = T | null

function qs<T extends HTMLElement>(sel: string): Maybe<T> {
  return document.querySelector(sel) as Maybe<T>
}

async function ensureSession() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    window.location.href = '/admin/login'
  }
}

async function main() {
  const authData = localStorage.getItem('adminAuth')
  if (!authData) {
    window.location.href = '/admin/login'
    return
  }

  const espacioSelect = qs<HTMLSelectElement>('#espacioSelect')
  const estadoBadge = qs<HTMLSpanElement>('#estadoBadge')
  const titulo = qs<HTMLElement>('#espacioTitulo')
  const form = qs<HTMLElement>('#espacioForm')
  const emptyState = qs<HTMLElement>('#espacioEmpty')
  const nombreInput = qs<HTMLInputElement>('#espacioNombre')
  const descripcionInput = qs<HTMLTextAreaElement>('#espacioDescripcion')
  const activoInput = qs<HTMLInputElement>('#espacioActivo')
  const configList = qs<HTMLDivElement>('#configList')
  const nuevaDisposicion = qs<HTMLSelectElement>('#nuevaDisposicion')
  const nuevaCapacidad = qs<HTMLInputElement>('#nuevaCapacidad')
  const btnAgregarConfig = qs<HTMLButtonElement>('#btnAgregarConfig')
  const btnGuardarEspacio = qs<HTMLButtonElement>('#btnGuardarEspacio')
  const btnRefrescar = qs<HTMLButtonElement>('#btnRefrescarEspacios')
  const btnCrearEspacio = qs<HTMLButtonElement>('#btnCrearEspacio')
  const nuevoNombre = qs<HTMLInputElement>('#nuevoNombre')
  const nuevoDescripcion = qs<HTMLTextAreaElement>('#nuevoDescripcion')
  const nuevoActivo = qs<HTMLInputElement>('#nuevoActivo')

  // Posts elements
  const postsSection = qs<HTMLElement>('#postsSection')
  const postsSectionTitle = qs<HTMLElement>('#postsSectionTitle')
  const postsList = qs<HTMLDivElement>('#postsList')
  const btnNuevoPost = qs<HTMLButtonElement>('#btnNuevoPost')
  const postEditorCard = qs<HTMLElement>('#postEditorCard')
  const postEditorTitle = qs<HTMLElement>('#postEditorTitle')
  const postTitulo = qs<HTMLInputElement>('#postTitulo')
  const postSlug = qs<HTMLInputElement>('#postSlug')
  const postImageUrl = qs<HTMLInputElement>('#postImageUrl')
  const postExcerpt = qs<HTMLTextAreaElement>('#postExcerpt')
  const postContent = qs<HTMLTextAreaElement>('#postContent')
  const postPublicado = qs<HTMLInputElement>('#postPublicado')
  const btnGuardarPost = qs<HTMLButtonElement>('#btnGuardarPost')
  const btnCancelarPost = qs<HTMLButtonElement>('#btnCancelarPost')

  let disposiciones: any[] = []
  let espacios: any[] = []
  let seleccionado: number | null = null
  let posts: SalonPost[] = []
  let editingPostId: number | null = null

  function setBadge(text: string, state: 'active' | 'inactive' | 'muted') {
    if (!estadoBadge) return
    estadoBadge.textContent = text
    estadoBadge.className = 'pill ' + (state === 'active' ? 'pill-active' : state === 'inactive' ? 'pill-inactive' : 'pill-muted')
  }

  function renderSelect() {
    if (!espacioSelect) return
    const current = seleccionado
    espacioSelect.innerHTML = '<option value="">Elegir salón...</option>' +
      espacios.map((e) => `<option value="${e.id}">${e.nombre}${e.activo ? '' : ' (inactivo)'}</option>`).join('')
    if (current) {
      espacioSelect.value = String(current)
    }
  }

  function renderConfigList(espacio: any) {
    if (!configList) return
    if (!espacio.configuraciones?.length) {
      configList.innerHTML = '<div class="placeholder">Sin disposiciones.</div>'
      return
    }
    configList.innerHTML = espacio.configuraciones
      .map((c: any) => {
        const nombreDisp = c.disposicionNombre ?? 'Disposición'
        return `
          <div class="config-card" data-config-id="${c.id}" data-espacio-id="${espacio.id}">
            <div class="config-title">${nombreDisp}</div>
            <input type="number" min="1" class="capacidad" value="${c.capacidad}" />
            <div class="config-actions">
              <button class="link" data-action="guardar-config" data-id="${c.id}" data-espacio="${espacio.id}">Guardar</button>
              <button class="link danger" data-action="eliminar-config" data-id="${c.id}" data-espacio="${espacio.id}">Eliminar</button>
            </div>
          </div>
        `
      })
      .join('')
  }

  function showEspacio(id: number | null) {
    if (!form || !emptyState) return
    if (!id) {
      form.hidden = true
      emptyState.hidden = false
      titulo && (titulo.textContent = 'Selecciona un salón')
      setBadge('Sin selección', 'muted')
      return
    }
    const espacio = espacios.find((e) => e.id === id)
    if (!espacio) return
    form.hidden = false
    emptyState.hidden = true
    if (titulo) titulo.textContent = espacio.nombre
    if (nombreInput) nombreInput.value = espacio.nombre || ''
    if (descripcionInput) descripcionInput.value = espacio.descripcion || ''
    if (activoInput) activoInput.checked = !!espacio.activo
    setBadge(espacio.activo ? 'Activo' : 'Inactivo', espacio.activo ? 'active' : 'inactive')
    renderConfigList(espacio)
  }

  function populateDisposicionesSelect() {
    if (!nuevaDisposicion) return
    nuevaDisposicion.innerHTML = disposiciones.map((d) => `<option value="${d.id}">${d.nombre}</option>`).join('')
  }

  async function loadDisposiciones() {
    try {
      const resp = await espaciosAdminAPI.listarDisposiciones()
      disposiciones = resp.data || []
      populateDisposicionesSelect()
    } catch (err) {
      console.error('Error disposiciones', err)
      disposiciones = []
      populateDisposicionesSelect()
    }
  }

  async function loadEspacios() {
    try {
      const resp = await espaciosAdminAPI.listar()
      espacios = resp.data || []
      renderSelect()
      if (seleccionado && !espacios.some((e: any) => e.id === seleccionado)) {
        seleccionado = null
      }
      if (!seleccionado && espacios.length) {
        seleccionado = espacios[0].id
      }
      if (espacioSelect && seleccionado) {
        espacioSelect.value = String(seleccionado)
      }
      showEspacio(seleccionado)
    } catch (err) {
      console.error(err)
      setBadge('Error cargando', 'muted')
    }
  }

  async function guardarEspacio() {
    if (!seleccionado) return alert('Selecciona un salón')
    const payload = {
      nombre: nombreInput?.value || '',
      descripcion: descripcionInput?.value || '',
      activo: !!activoInput?.checked,
    }
    try {
      await espaciosAdminAPI.actualizar(seleccionado, payload)
      await loadEspacios()
      alert('Salón actualizado')
    } catch (err: any) {
      alert(err?.message || 'No se pudo guardar el salón')
    }
  }

  async function agregarConfig() {
    if (!seleccionado) return alert('Selecciona un salón')
    const disposicionId = Number(nuevaDisposicion?.value)
    const capacidad = Number(nuevaCapacidad?.value)
    if (!disposicionId || !capacidad) {
      alert('Selecciona disposición y capacidad')
      return
    }
    try {
      await espaciosAdminAPI.agregarConfiguracion(seleccionado, { disposicionId, capacidad })
      nuevaCapacidad && (nuevaCapacidad.value = '')
      await loadEspacios()
      alert('Configuración agregada')
    } catch (err: any) {
      alert(err?.message || 'No se pudo agregar la configuración')
    }
  }

  async function guardarConfig(configId: number, espacioId: number, row: Element) {
    const capacidad = Number((row.querySelector('.capacidad') as HTMLInputElement | null)?.value)
    if (!capacidad) {
      alert('Capacidad requerida')
      return
    }
    try {
      await espaciosAdminAPI.actualizarConfiguracion(espacioId, configId, { capacidad })
      await loadEspacios()
      alert('Configuración actualizada')
    } catch (err: any) {
      alert(err?.message || 'No se pudo actualizar')
    }
  }

  async function eliminarConfig(configId: number, espacioId: number) {
    if (!confirm('¿Eliminar configuración?')) return
    try {
      await espaciosAdminAPI.eliminarConfiguracion(espacioId, configId)
      await loadEspacios()
      alert('Configuración eliminada')
    } catch (err: any) {
      alert(err?.message || 'No se pudo eliminar')
    }
  }

  async function crearEspacio() {
    const nombre = nuevoNombre?.value?.trim()
    if (!nombre) return alert('Ingresa un nombre para el salón')
    const descripcion = nuevoDescripcion?.value?.trim() || undefined
    const activo = !!nuevoActivo?.checked
    try {
      const resp = await espaciosAdminAPI.crear({ nombre, descripcion, activo })
      nuevoNombre && (nuevoNombre.value = '')
      nuevoDescripcion && (nuevoDescripcion.value = '')
      if (nuevoActivo) nuevoActivo.checked = true
      await loadEspacios()
      const createdId = resp?.data?.id
      if (createdId) {
        seleccionado = createdId
        if (espacioSelect) espacioSelect.value = String(createdId)
      }
      showEspacio(seleccionado)
      alert('Salón creado')
    } catch (err: any) {
      alert(err?.message || 'No se pudo crear el salón')
    }
  }

  espacioSelect?.addEventListener('change', (e) => {
    const val = Number((e.target as HTMLSelectElement).value)
    seleccionado = val || null
    showEspacio(seleccionado)
    if (seleccionado) {
      loadPosts()
    } else {
      if (postsSection) postsSection.hidden = true
      if (postEditorCard) postEditorCard.hidden = true
    }
  })

  btnGuardarEspacio?.addEventListener('click', guardarEspacio)
  btnAgregarConfig?.addEventListener('click', agregarConfig)
  btnRefrescar?.addEventListener('click', () => {
    loadDisposiciones()
    loadEspacios()
  })
  btnCrearEspacio?.addEventListener('click', crearEspacio)

  configList?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target?.dataset) return
    const action = target.dataset.action
    const configId = Number(target.dataset.id)
    const espacioId = Number(target.dataset.espacio)
    if (!action || !configId || !espacioId) return
    const row = target.closest('.config-card')
    if (!row) return
    if (action === 'guardar-config') guardarConfig(configId, espacioId, row)
    if (action === 'eliminar-config') eliminarConfig(configId, espacioId)
  })

  // ============================================
  // SALON POSTS FUNCTIONALITY
  // ============================================

  function generateSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Only alphanumeric and spaces
      .replace(/\s+/g, '-') // Spaces to hyphens
      .replace(/-+/g, '-') // Multiple hyphens to one
      .trim()
  }

  async function loadPosts() {
    if (!seleccionado || !postsSection || !postsList) return
    
    try {
      const resp = await salonPostsAPI.listarAdmin()
      const allPosts = resp.data || []
      
      // Filter posts for current espacio
      posts = allPosts.filter(p => p.espacioId === seleccionado)
      
      console.log('=== LOAD POSTS DEBUG ===')
      console.log('Selected espacio ID:', seleccionado)
      console.log('Total posts from API:', allPosts.length)
      console.log('Filtered posts:', posts.length)
      console.log('Sample post structure:', allPosts[0])
      console.log('Posts for this espacio:', posts)
      
      const espacioNombre = espacios.find(e => e.id === seleccionado)?.nombre || 'este salón'
      if (postsSectionTitle) {
        postsSectionTitle.textContent = `Posts de ${espacioNombre}`
      }
      
      postsSection.hidden = false
      renderPostsList()
    } catch (err) {
      console.error('Error loading posts:', err)
      posts = []
      renderPostsList()
    }
  }

  function renderPostsList() {
    if (!postsList) return
    
    if (!posts.length) {
      postsList.innerHTML = '<div class="placeholder">No hay posts para este salón.</div>'
      return
    }

    postsList.innerHTML = posts.map(post => `
      <div class="post-card" data-post-id="${post.id}">
        <div class="post-info">
          <h4 class="post-title">${post.titulo}</h4>
          <p class="post-excerpt">${post.excerpt || 'Sin resumen'}</p>
          <div class="post-meta">
            <span class="post-status ${post.publicado ? 'published' : 'draft'}">
              ${post.publicado ? '✓ Publicado' : '📝 Borrador'}
            </span>
            <span style="color: #6b7280; font-size: 0.85rem;">${post.slug}</span>
          </div>
        </div>
        <div class="post-actions">
          <button class="btn secondary" data-action="editar-post" data-id="${post.id}">
            Editar
          </button>
          <button class="btn ghost" data-action="eliminar-post" data-id="${post.id}">
            Eliminar
          </button>
        </div>
      </div>
    `).join('')
  }

  async function showPostEditor(postId: number | null = null) {
    if (!postEditorCard) return
    
    console.log('=== SHOW POST EDITOR DEBUG ===')
    console.log('Requested post ID:', postId)
    
    editingPostId = postId
    
    // Find or fetch the post
    let post: any = null
    if (postId) {
      // First try to find in local array
      post = posts.find(p => p.id === postId)
      
      // If not found, fetch from API
      if (!post) {
        console.log('Post not in local array, fetching from API...')
        try {
          const resp = await salonPostsAPI.obtener(postId)
          post = resp.data
          console.log('Fetched post from API:', post)
        } catch (err) {
          console.error('Error fetching post:', err)
          alert('Error: No se pudo cargar el post. Intenta refrescar la página.')
          return
        }
      } else {
        console.log('Found post in local array:', post)
      }
    }
    
    if (postEditorTitle) {
      postEditorTitle.textContent = post ? 'Editar post' : 'Nuevo post'
    }
    
    // Populate fields
    if (postTitulo) {
      postTitulo.value = post?.titulo || ''
      console.log('✓ Titulo:', postTitulo.value)
    }
    
    if (postSlug) {
      postSlug.value = post?.slug || ''
      console.log('✓ Slug:', postSlug.value)
    }
    
    if (postImageUrl) {
      postImageUrl.value = post?.mainImageUrl || ''
      console.log('✓ ImageUrl:', postImageUrl.value)
    }
    
    if (postExcerpt) {
      postExcerpt.value = post?.excerpt || ''
      console.log('✓ Excerpt:', postExcerpt.value)
    }
    
    if (postContent) {
      postContent.value = post?.content || ''
      console.log('✓ Content (length):', postContent.value.length, 'chars')
    }
    
    if (postPublicado) {
      postPublicado.checked = post?.publicado ?? false
      console.log('✓ Publicado:', postPublicado.checked)
    }
    
    console.log('=== END DEBUG ===')
    
    postEditorCard.hidden = false
    setTimeout(() => {
      postEditorCard?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  function hidePostEditor() {
    if (!postEditorCard) return
    postEditorCard.hidden = true
    editingPostId = null
  }

  async function guardarPost() {
    if (!seleccionado) {
      alert('Selecciona un salón primero')
      return
    }

    const titulo = postTitulo?.value?.trim()
    if (!titulo) {
      alert('El título es requerido')
      return
    }

    const content = postContent?.value?.trim()
    if (!content) {
      alert('El contenido es requerido')
      return
    }

    let slug = postSlug?.value?.trim()
    if (!slug) {
      slug = generateSlug(titulo)
      if (postSlug) postSlug.value = slug
    }

    const data = {
      espacioId: seleccionado,
      titulo,
      slug,
      excerpt: postExcerpt?.value?.trim() || null,
      content,
      mainImageUrl: postImageUrl?.value?.trim() || null,
      publicado: postPublicado?.checked || false,
    }

    try {
      if (editingPostId) {
        await salonPostsAPI.actualizar(editingPostId, data)
        alert('Post actualizado')
      } else {
        await salonPostsAPI.crear(data)
        alert('Post creado')
      }
      hidePostEditor()
      await loadPosts()
    } catch (err: any) {
      alert(err?.message || 'Error al guardar el post')
    }
  }

  async function togglePublicarPost(postId: number) {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    try {
      await salonPostsAPI.togglePublicar(postId, !post.publicado)
      await loadPosts()
      alert(post.publicado ? 'Post despublicado' : 'Post publicado')
    } catch (err: any) {
      alert(err?.message || 'Error al cambiar estado del post')
    }
  }

  async function eliminarPost(postId: number) {
    if (!confirm('¿Eliminar este post? Esta acción no se puede deshacer.')) return

    try {
      await salonPostsAPI.eliminar(postId)
      await loadPosts()
      alert('Post eliminado')
    } catch (err: any) {
      alert(err?.message || 'Error al eliminar el post')
    }
  }

  // Auto-generate slug when title changes
  postTitulo?.addEventListener('input', (e) => {
    const titulo = (e.target as HTMLInputElement).value
    if (!editingPostId && titulo && postSlug) {
      postSlug.value = generateSlug(titulo)
    }
  })

  btnNuevoPost?.addEventListener('click', () => showPostEditor(null))
  btnCancelarPost?.addEventListener('click', hidePostEditor)
  btnGuardarPost?.addEventListener('click', guardarPost)

  postsList?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    // Find the button element (in case we clicked on text inside button)
    const button = target.closest('button[data-action]') as HTMLElement
    if (!button?.dataset) return
    
    const action = button.dataset.action
    const postId = Number(button.dataset.id)
    
    console.log('Post action clicked:', action, 'for post ID:', postId)
    
    if (!action || !postId) return

    if (action === 'editar-post') showPostEditor(postId)
    if (action === 'eliminar-post') eliminarPost(postId)
  })

  await ensureSession()
  await loadDisposiciones()
  await loadEspacios()
  if (seleccionado) {
    await loadPosts()
  }
}

window.addEventListener('DOMContentLoaded', () => {
  main().catch((err) => console.error('Error inicializando espacios admin', err))
})
