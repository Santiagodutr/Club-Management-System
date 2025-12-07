import { createClient } from '@supabase/supabase-js';
export { renderers } from '../../renderers.mjs';

const API_URL = "http://localhost:3333";
const SUPABASE_URL = "https://bnoftsxwpxzmwjrmxoxc.supabase.co";
const SUPABASE_KEY = "sb_publishable_YLeoJK1Kxf_Xm0nAHlmO8Q_2cHXCub1";
createClient(SUPABASE_URL, SUPABASE_KEY);
document.addEventListener("DOMContentLoaded", () => {
  let eventos = [];
  let eventosFiltrados = [];
  let espacios = [];
  let currentPage = 1;
  const itemsPerPage = 10;
  const eventosList = document.getElementById("eventosList");
  const btnNuevoEvento = document.getElementById("btnNuevoEvento");
  const filtroEspacio = document.getElementById("filtroEspacio");
  const paginationContainer = document.getElementById("paginationContainer");
  const totalEventosSpan = document.getElementById("totalEventos");
  function showNotification(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = type === "success" ? "✓" : type === "error" ? "✕" : "⚠";
    toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close">&times;</button>
  `;
    container.appendChild(toast);
    const closeBtn = toast.querySelector(".toast-close");
    closeBtn?.addEventListener("click", () => removeToast(toast));
    setTimeout(() => removeToast(toast), 5e3);
  }
  function removeToast(toast) {
    toast.classList.add("removing");
    setTimeout(() => toast.remove(), 300);
  }
  function getAuthToken() {
    const authData = localStorage.getItem("adminAuth");
    return authData ? JSON.parse(authData).token : null;
  }
  async function cargarEspacios() {
    try {
      const response = await fetch(`${API_URL}/api/espacios`);
      const result = await response.json();
      if (result.success) {
        espacios = result.data;
        renderFiltroEspacios();
      }
    } catch (error) {
      console.error("Error cargando espacios:", error);
    }
  }
  function renderFiltroEspacios() {
    if (!filtroEspacio) return;
    filtroEspacio.innerHTML = '<option value="">Todos los salones</option>';
    espacios.forEach((espacio) => {
      const option = document.createElement("option");
      option.value = espacio.id.toString();
      option.textContent = espacio.nombre;
      filtroEspacio.appendChild(option);
    });
  }
  async function cargarEventos() {
    if (!eventosList) return;
    eventosList.innerHTML = '<div class="placeholder">Cargando eventos...</div>';
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/salon-posts`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        eventos = result.data;
        aplicarFiltros();
      } else {
        eventosList.innerHTML = '<div class="placeholder">Error al cargar eventos</div>';
      }
    } catch (error) {
      console.error("Error cargando eventos:", error);
      eventosList.innerHTML = '<div class="placeholder">Error de conexión</div>';
    }
  }
  function aplicarFiltros() {
    const espacioSeleccionado = filtroEspacio?.value;
    eventosFiltrados = eventos.filter((evento) => {
      if (espacioSeleccionado && evento.espacioId?.toString() !== espacioSeleccionado) {
        return false;
      }
      return true;
    });
    currentPage = 1;
    renderEventos();
    renderPaginacion();
    actualizarContador();
  }
  function actualizarContador() {
    if (totalEventosSpan) {
      totalEventosSpan.textContent = `${eventosFiltrados.length} evento${eventosFiltrados.length !== 1 ? "s" : ""}`;
    }
  }
  function renderEventos() {
    if (!eventosList) return;
    if (eventosFiltrados.length === 0) {
      eventosList.innerHTML = '<div class="placeholder">No hay eventos que coincidan con los filtros.</div>';
      return;
    }
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const eventosPagina = eventosFiltrados.slice(start, end);
    eventosList.innerHTML = eventosPagina.map((evento) => {
      const primeraImagen = evento.imagenes && evento.imagenes.length > 0 ? evento.imagenes[0].url : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="75" viewBox="0 0 100 75"%3E%3Crect fill="%23f3f4f6" width="100" height="75"/%3E%3Ctext x="50" y="40" font-family="Arial" font-size="12" fill="%239ca3af" text-anchor="middle"%3ESin imagen%3C/text%3E%3C/svg%3E';
      const fecha = evento.publishedAt ? new Date(evento.publishedAt).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }) : "Sin fecha";
      const salonTag = evento.espacio?.nombre ? `<span class="evento-tag salon-tag">${evento.espacio.nombre}</span>` : "";
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
    `;
    }).join("");
  }
  function renderPaginacion() {
    if (!paginationContainer) return;
    const totalPages = Math.ceil(eventosFiltrados.length / itemsPerPage);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }
    let paginationHTML = '<div class="pagination">';
    if (currentPage > 1) {
      paginationHTML += `<button class="pagination-btn" data-page="${currentPage - 1}">← Anterior</button>`;
    }
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    if (startPage > 1) {
      paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<button class="pagination-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationHTML += `<span class="pagination-ellipsis">...</span>`;
      }
      paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
    }
    if (currentPage < totalPages) {
      paginationHTML += `<button class="pagination-btn" data-page="${currentPage + 1}">Siguiente →</button>`;
    }
    paginationHTML += "</div>";
    paginationContainer.innerHTML = paginationHTML;
  }
  let eventoIdToDelete = null;
  function mostrarModalEliminar(id) {
    eventoIdToDelete = id;
    const modal = document.getElementById("confirmModal");
    if (modal) {
      modal.classList.remove("hidden");
    }
  }
  function ocultarModalEliminar() {
    eventoIdToDelete = null;
    const modal = document.getElementById("confirmModal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }
  async function eliminarEvento() {
    if (!eventoIdToDelete) return;
    ocultarModalEliminar();
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/admin/salon-posts/${eventoIdToDelete}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        showNotification("Evento eliminado exitosamente");
        await cargarEventos();
      } else {
        showNotification("Error al eliminar", "error");
      }
    } catch (error) {
      console.error("Error eliminando evento:", error);
      showNotification("Error de conexión", "error");
    } finally {
      eventoIdToDelete = null;
    }
  }
  btnNuevoEvento?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/admin/eventos/nuevo";
  });
  filtroEspacio?.addEventListener("change", aplicarFiltros);
  paginationContainer?.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("pagination-btn")) {
      const page = parseInt(target.getAttribute("data-page") || "1");
      currentPage = page;
      renderEventos();
      renderPaginacion();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  if (eventosList) {
    eventosList.addEventListener("click", (e) => {
      const target = e.target;
      const button = target.matches("button[data-action]") ? target : target.closest("button[data-action]");
      if (!button) return;
      e.preventDefault();
      e.stopPropagation();
      const action = button.getAttribute("data-action");
      const id = button.getAttribute("data-id");
      if (action === "editar" && id) {
        window.location.href = `/admin/eventos/${id}/editar`;
      } else if (action === "eliminar" && id) {
        mostrarModalEliminar(parseInt(id));
      }
    }, false);
  }
  const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
  const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
  const confirmModal = document.getElementById("confirmModal");
  btnConfirmarEliminar?.addEventListener("click", eliminarEvento);
  btnCancelarEliminar?.addEventListener("click", ocultarModalEliminar);
  confirmModal?.addEventListener("click", (e) => {
    if (e.target === confirmModal) {
      ocultarModalEliminar();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && eventoIdToDelete !== null) {
      ocultarModalEliminar();
    }
  });
  async function init() {
    await cargarEspacios();
    await cargarEventos();
  }
  init();
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
