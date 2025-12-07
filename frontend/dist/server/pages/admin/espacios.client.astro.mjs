import { s as salonPostsAPI, e as espaciosAdminAPI, a as supabase } from '../../chunks/supabase_CYgU43WC.mjs';
export { renderers } from '../../renderers.mjs';

function qs(sel) {
  return document.querySelector(sel);
}
let hayCambiosSinPublicar = false;
function marcarCambiosSinPublicar() {
  hayCambiosSinPublicar = true;
  localStorage.setItem("hayCambiosSinPublicar", "true");
  const btnPublicar = document.getElementById("btnPublicarCambios");
  if (btnPublicar) {
    btnPublicar.style.display = "inline-flex";
  }
}
function verificarCambiosPendientes() {
  const hayCambios = localStorage.getItem("hayCambiosSinPublicar") === "true";
  if (hayCambios) {
    const btnPublicar = document.getElementById("btnPublicarCambios");
    if (btnPublicar) {
      btnPublicar.style.display = "inline-flex";
    }
  }
}
function mostrarModalPublicar() {
  const modal = document.getElementById("publicarModal");
  if (modal) {
    modal.classList.remove("hidden");
  }
}
function cerrarModalPublicar() {
  const modal = document.getElementById("publicarModal");
  if (modal) {
    modal.classList.add("hidden");
  }
  const mensaje = document.getElementById("mensajePublicar");
  if (mensaje) {
    mensaje.classList.add("hidden");
    mensaje.textContent = "";
  }
}
function mostrarMensajePublicar(texto, tipo) {
  const mensaje = document.getElementById("mensajePublicar");
  if (!mensaje) return;
  mensaje.classList.remove("hidden", "exito", "error", "info");
  mensaje.classList.add(tipo);
  mensaje.textContent = texto;
}
async function publicarCambios() {
  const btnConfirmar = document.getElementById("btnConfirmarPublicar");
  const btnCancelar = document.getElementById("btnCancelarPublicar");
  if (btnConfirmar) {
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = "Publicando...";
  }
  if (btnCancelar) btnCancelar.disabled = true;
  mostrarMensajePublicar("Iniciando publicación...", "info");
  try {
    const adminAuth = localStorage.getItem("adminAuth");
    if (!adminAuth) {
      throw new Error("No hay sesión activa");
    }
    const { token } = JSON.parse(adminAuth);
    const backendUrl = "http://localhost:3333";
    const response = await fetch(`${backendUrl}/admin/trigger-rebuild`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Error al publicar: ${response.statusText}`);
    }
    mostrarMensajePublicar("✅ Publicación iniciada exitosamente. Los cambios se verán en el sitio en 2-3 minutos.", "exito");
    hayCambiosSinPublicar = false;
    localStorage.removeItem("hayCambiosSinPublicar");
    const btnPublicar = document.getElementById("btnPublicarCambios");
    if (btnPublicar) {
      btnPublicar.style.display = "none";
    }
    setTimeout(() => {
      cerrarModalPublicar();
      if (btnConfirmar) {
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = "Publicar Ahora";
      }
      if (btnCancelar) btnCancelar.disabled = false;
    }, 3e3);
  } catch (error) {
    console.error("Error al publicar:", error);
    mostrarMensajePublicar(`❌ Error: ${error instanceof Error ? error.message : "Error desconocido"}`, "error");
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = "Publicar Ahora";
    }
    if (btnCancelar) btnCancelar.disabled = false;
  }
}
async function ensureSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    window.location.href = "/admin/login";
  }
}
async function main() {
  const authData = localStorage.getItem("adminAuth");
  if (!authData) {
    window.location.href = "/admin/login";
    return;
  }
  const espacioSelect = qs("#espacioSelect");
  const estadoBadge = qs("#estadoBadge");
  const titulo = qs("#espacioTitulo");
  const form = qs("#espacioForm");
  const emptyState = qs("#espacioEmpty");
  const nombreInput = qs("#espacioNombre");
  const descripcionInput = qs("#espacioDescripcion");
  const activoInput = qs("#espacioActivo");
  const configList = qs("#configList");
  const nuevaDisposicion = qs("#nuevaDisposicion");
  const nuevaCapacidad = qs("#nuevaCapacidad");
  const btnAgregarConfig = qs("#btnAgregarConfig");
  const btnGuardarEspacio = qs("#btnGuardarEspacio");
  const btnRefrescar = qs("#btnRefrescarEspacios");
  const btnCrearEspacio = qs("#btnCrearEspacio");
  const nuevoNombre = qs("#nuevoNombre");
  const nuevoDescripcion = qs("#nuevoDescripcion");
  const nuevoActivo = qs("#nuevoActivo");
  const postsSection = qs("#postsSection");
  const postsSectionTitle = qs("#postsSectionTitle");
  const postsList = qs("#postsList");
  const btnNuevoPost = qs("#btnNuevoPost");
  const postEditorCard = qs("#postEditorCard");
  const postEditorTitle = qs("#postEditorTitle");
  const postTitulo = qs("#postTitulo");
  const postSlug = qs("#postSlug");
  const postImageUrl = qs("#postImageUrl");
  const postExcerpt = qs("#postExcerpt");
  const postContent = qs("#postContent");
  const postPublicado = qs("#postPublicado");
  const btnGuardarPost = qs("#btnGuardarPost");
  const btnCancelarPost = qs("#btnCancelarPost");
  let disposiciones = [];
  let espacios = [];
  let seleccionado = null;
  let posts = [];
  let editingPostId = null;
  function setBadge(text, state) {
    if (!estadoBadge) return;
    estadoBadge.textContent = text;
    estadoBadge.className = "pill " + (state === "active" ? "pill-active" : state === "inactive" ? "pill-inactive" : "pill-muted");
  }
  function renderSelect() {
    if (!espacioSelect) return;
    const current = seleccionado;
    espacioSelect.innerHTML = '<option value="">Elegir salón...</option>' + espacios.map((e) => `<option value="${e.id}">${e.nombre}${e.activo ? "" : " (inactivo)"}</option>`).join("");
    if (current) {
      espacioSelect.value = String(current);
    }
  }
  function renderConfigList(espacio) {
    if (!configList) return;
    if (!espacio.configuraciones?.length) {
      configList.innerHTML = '<div class="placeholder">Sin disposiciones.</div>';
      return;
    }
    configList.innerHTML = espacio.configuraciones.map((c) => {
      const nombreDisp = c.disposicionNombre ?? "Disposición";
      return `
          <div class="config-card" data-config-id="${c.id}" data-espacio-id="${espacio.id}">
            <div class="config-title">${nombreDisp}</div>
            <input type="number" min="1" class="capacidad" value="${c.capacidad}" />
            <div class="config-actions">
              <button class="link" data-action="guardar-config" data-id="${c.id}" data-espacio="${espacio.id}">Guardar</button>
              <button class="link danger" data-action="eliminar-config" data-id="${c.id}" data-espacio="${espacio.id}">Eliminar</button>
            </div>
          </div>
        `;
    }).join("");
  }
  function showEspacio(id) {
    if (!form || !emptyState) return;
    if (!id) {
      form.hidden = true;
      emptyState.hidden = false;
      titulo && (titulo.textContent = "Selecciona un salón");
      setBadge("Sin selección", "muted");
      return;
    }
    const espacio = espacios.find((e) => e.id === id);
    if (!espacio) return;
    form.hidden = false;
    emptyState.hidden = true;
    if (titulo) titulo.textContent = espacio.nombre;
    if (nombreInput) nombreInput.value = espacio.nombre || "";
    if (descripcionInput) descripcionInput.value = espacio.descripcion || "";
    if (activoInput) activoInput.checked = !!espacio.activo;
    setBadge(espacio.activo ? "Activo" : "Inactivo", espacio.activo ? "active" : "inactive");
    renderConfigList(espacio);
  }
  function populateDisposicionesSelect() {
    if (!nuevaDisposicion) return;
    nuevaDisposicion.innerHTML = disposiciones.map((d) => `<option value="${d.id}">${d.nombre}</option>`).join("");
  }
  async function loadDisposiciones() {
    try {
      const resp = await espaciosAdminAPI.listarDisposiciones();
      disposiciones = resp.data || [];
      populateDisposicionesSelect();
    } catch (err) {
      console.error("Error disposiciones", err);
      disposiciones = [];
      populateDisposicionesSelect();
    }
  }
  async function loadEspacios() {
    try {
      const resp = await espaciosAdminAPI.listar();
      espacios = resp.data || [];
      renderSelect();
      if (seleccionado && !espacios.some((e) => e.id === seleccionado)) {
        seleccionado = null;
      }
      if (!seleccionado && espacios.length) {
        seleccionado = espacios[0].id;
      }
      if (espacioSelect && seleccionado) {
        espacioSelect.value = String(seleccionado);
      }
      showEspacio(seleccionado);
    } catch (err) {
      console.error(err);
      setBadge("Error cargando", "muted");
    }
  }
  async function guardarEspacio() {
    if (!seleccionado) return alert("Selecciona un salón");
    const payload = {
      nombre: nombreInput?.value || "",
      descripcion: descripcionInput?.value || "",
      activo: !!activoInput?.checked
    };
    try {
      await espaciosAdminAPI.actualizar(seleccionado, payload);
      await loadEspacios();
      marcarCambiosSinPublicar();
      alert("Salón actualizado");
    } catch (err) {
      alert(err?.message || "No se pudo guardar el salón");
    }
  }
  async function agregarConfig() {
    if (!seleccionado) return alert("Selecciona un salón");
    const disposicionId = Number(nuevaDisposicion?.value);
    const capacidad = Number(nuevaCapacidad?.value);
    if (!disposicionId || !capacidad) {
      alert("Selecciona disposición y capacidad");
      return;
    }
    try {
      await espaciosAdminAPI.agregarConfiguracion(seleccionado, { disposicionId, capacidad });
      nuevaCapacidad && (nuevaCapacidad.value = "");
      await loadEspacios();
      marcarCambiosSinPublicar();
      alert("Configuración agregada");
    } catch (err) {
      alert(err?.message || "No se pudo agregar la configuración");
    }
  }
  async function guardarConfig(configId, espacioId, row) {
    const capacidad = Number(row.querySelector(".capacidad")?.value);
    if (!capacidad) {
      alert("Capacidad requerida");
      return;
    }
    try {
      await espaciosAdminAPI.actualizarConfiguracion(espacioId, configId, { capacidad });
      await loadEspacios();
      marcarCambiosSinPublicar();
      alert("Configuración actualizada");
    } catch (err) {
      alert(err?.message || "No se pudo actualizar");
    }
  }
  async function eliminarConfig(configId, espacioId) {
    if (!confirm("¿Eliminar configuración?")) return;
    try {
      await espaciosAdminAPI.eliminarConfiguracion(espacioId, configId);
      await loadEspacios();
      marcarCambiosSinPublicar();
      alert("Configuración eliminada");
    } catch (err) {
      alert(err?.message || "No se pudo eliminar");
    }
  }
  async function crearEspacio() {
    const nombre = nuevoNombre?.value?.trim();
    if (!nombre) return alert("Ingresa un nombre para el salón");
    const descripcion = nuevoDescripcion?.value?.trim() || void 0;
    const activo = !!nuevoActivo?.checked;
    try {
      const resp = await espaciosAdminAPI.crear({ nombre, descripcion, activo });
      nuevoNombre && (nuevoNombre.value = "");
      nuevoDescripcion && (nuevoDescripcion.value = "");
      if (nuevoActivo) nuevoActivo.checked = true;
      await loadEspacios();
      const createdId = resp?.data?.id;
      if (createdId) {
        seleccionado = createdId;
        if (espacioSelect) espacioSelect.value = String(createdId);
      }
      showEspacio(seleccionado);
      marcarCambiosSinPublicar();
      alert("Salón creado");
    } catch (err) {
      alert(err?.message || "No se pudo crear el salón");
    }
  }
  espacioSelect?.addEventListener("change", (e) => {
    const val = Number(e.target.value);
    seleccionado = val || null;
    showEspacio(seleccionado);
    if (seleccionado) {
      loadPosts();
    } else {
      if (postsSection) postsSection.hidden = true;
      if (postEditorCard) postEditorCard.hidden = true;
    }
  });
  btnGuardarEspacio?.addEventListener("click", guardarEspacio);
  btnAgregarConfig?.addEventListener("click", agregarConfig);
  btnRefrescar?.addEventListener("click", () => {
    loadDisposiciones();
    loadEspacios();
  });
  btnCrearEspacio?.addEventListener("click", crearEspacio);
  configList?.addEventListener("click", (e) => {
    const target = e.target;
    if (!target?.dataset) return;
    const action = target.dataset.action;
    const configId = Number(target.dataset.id);
    const espacioId = Number(target.dataset.espacio);
    if (!action || !configId || !espacioId) return;
    const row = target.closest(".config-card");
    if (!row) return;
    if (action === "guardar-config") guardarConfig(configId, espacioId, row);
    if (action === "eliminar-config") eliminarConfig(configId, espacioId);
  });
  function generateSlug(titulo2) {
    return titulo2.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
  }
  async function loadPosts() {
    if (!seleccionado || !postsSection || !postsList) return;
    try {
      const resp = await salonPostsAPI.listarAdmin();
      const allPosts = resp.data || [];
      posts = allPosts.filter((p) => p.espacioId === seleccionado);
      console.log("=== LOAD POSTS DEBUG ===");
      console.log("Selected espacio ID:", seleccionado);
      console.log("Total posts from API:", allPosts.length);
      console.log("Filtered posts:", posts.length);
      console.log("Sample post structure:", allPosts[0]);
      console.log("Posts for this espacio:", posts);
      const espacioNombre = espacios.find((e) => e.id === seleccionado)?.nombre || "este salón";
      if (postsSectionTitle) {
        postsSectionTitle.textContent = `Posts de ${espacioNombre}`;
      }
      postsSection.hidden = false;
      renderPostsList();
    } catch (err) {
      console.error("Error loading posts:", err);
      posts = [];
      renderPostsList();
    }
  }
  function renderPostsList() {
    if (!postsList) return;
    if (!posts.length) {
      postsList.innerHTML = '<div class="placeholder">No hay posts para este salón.</div>';
      return;
    }
    postsList.innerHTML = posts.map((post) => `
      <div class="post-card" data-post-id="${post.id}">
        <div class="post-info">
          <h4 class="post-title">${post.titulo}</h4>
          <p class="post-excerpt">${post.excerpt || "Sin resumen"}</p>
          <div class="post-meta">
            <span class="post-status ${post.publicado ? "published" : "draft"}">
              ${post.publicado ? "✓ Publicado" : "📝 Borrador"}
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
    `).join("");
  }
  async function showPostEditor(postId = null) {
    if (!postEditorCard) return;
    console.log("=== SHOW POST EDITOR DEBUG ===");
    console.log("Requested post ID:", postId);
    editingPostId = postId;
    let post = null;
    if (postId) {
      post = posts.find((p) => p.id === postId);
      if (!post) {
        console.log("Post not in local array, fetching from API...");
        try {
          const resp = await salonPostsAPI.obtener(postId);
          post = resp.data;
          console.log("Fetched post from API:", post);
        } catch (err) {
          console.error("Error fetching post:", err);
          alert("Error: No se pudo cargar el post. Intenta refrescar la página.");
          return;
        }
      } else {
        console.log("Found post in local array:", post);
      }
    }
    if (postEditorTitle) {
      postEditorTitle.textContent = post ? "Editar post" : "Nuevo post";
    }
    if (postTitulo) {
      postTitulo.value = post?.titulo || "";
      console.log("✓ Titulo:", postTitulo.value);
    }
    if (postSlug) {
      postSlug.value = post?.slug || "";
      console.log("✓ Slug:", postSlug.value);
    }
    if (postImageUrl) {
      postImageUrl.value = post?.mainImageUrl || "";
      console.log("✓ ImageUrl:", postImageUrl.value);
    }
    if (postExcerpt) {
      postExcerpt.value = post?.excerpt || "";
      console.log("✓ Excerpt:", postExcerpt.value);
    }
    if (postContent) {
      postContent.value = post?.content || "";
      console.log("✓ Content (length):", postContent.value.length, "chars");
    }
    if (postPublicado) {
      postPublicado.checked = post?.publicado ?? false;
      console.log("✓ Publicado:", postPublicado.checked);
    }
    console.log("=== END DEBUG ===");
    postEditorCard.hidden = false;
    setTimeout(() => {
      postEditorCard?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
  function hidePostEditor() {
    if (!postEditorCard) return;
    postEditorCard.hidden = true;
    editingPostId = null;
  }
  async function guardarPost() {
    if (!seleccionado) {
      alert("Selecciona un salón primero");
      return;
    }
    const titulo2 = postTitulo?.value?.trim();
    if (!titulo2) {
      alert("El título es requerido");
      return;
    }
    const content = postContent?.value?.trim();
    if (!content) {
      alert("El contenido es requerido");
      return;
    }
    let slug = postSlug?.value?.trim();
    if (!slug) {
      slug = generateSlug(titulo2);
      if (postSlug) postSlug.value = slug;
    }
    const data = {
      espacioId: seleccionado,
      titulo: titulo2,
      slug,
      excerpt: postExcerpt?.value?.trim() || null,
      content,
      mainImageUrl: postImageUrl?.value?.trim() || null,
      publicado: postPublicado?.checked || false
    };
    try {
      if (editingPostId) {
        await salonPostsAPI.actualizar(editingPostId, data);
        alert("Post actualizado");
      } else {
        await salonPostsAPI.crear(data);
        alert("Post creado");
      }
      hidePostEditor();
      await loadPosts();
    } catch (err) {
      alert(err?.message || "Error al guardar el post");
    }
  }
  async function eliminarPost(postId) {
    if (!confirm("¿Eliminar este post? Esta acción no se puede deshacer.")) return;
    try {
      await salonPostsAPI.eliminar(postId);
      await loadPosts();
      alert("Post eliminado");
    } catch (err) {
      alert(err?.message || "Error al eliminar el post");
    }
  }
  postTitulo?.addEventListener("input", (e) => {
    const titulo2 = e.target.value;
    if (!editingPostId && titulo2 && postSlug) {
      postSlug.value = generateSlug(titulo2);
    }
  });
  btnNuevoPost?.addEventListener("click", () => showPostEditor(null));
  btnCancelarPost?.addEventListener("click", hidePostEditor);
  btnGuardarPost?.addEventListener("click", guardarPost);
  postsList?.addEventListener("click", (e) => {
    const target = e.target;
    const button = target.closest("button[data-action]");
    if (!button?.dataset) return;
    const action = button.dataset.action;
    const postId = Number(button.dataset.id);
    console.log("Post action clicked:", action, "for post ID:", postId);
    if (!action || !postId) return;
    if (action === "editar-post") showPostEditor(postId);
    if (action === "eliminar-post") eliminarPost(postId);
  });
  const btnPublicarCambios = document.getElementById("btnPublicarCambios");
  const btnCancelarPublicar = document.getElementById("btnCancelarPublicar");
  const btnConfirmarPublicar = document.getElementById("btnConfirmarPublicar");
  btnPublicarCambios?.addEventListener("click", mostrarModalPublicar);
  btnCancelarPublicar?.addEventListener("click", cerrarModalPublicar);
  btnConfirmarPublicar?.addEventListener("click", publicarCambios);
  await ensureSession();
  await loadDisposiciones();
  await loadEspacios();
  verificarCambiosPendientes();
  if (seleccionado) {
    await loadPosts();
  }
}
window.addEventListener("DOMContentLoaded", () => {
  main().catch((err) => console.error("Error inicializando espacios admin", err));
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
