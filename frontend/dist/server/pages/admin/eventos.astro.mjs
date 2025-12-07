import { c as createComponent, r as renderTemplate, d as renderComponent, m as maybeRenderHead } from '../../chunks/astro/server_-MRgVDm6.mjs';
import 'kleur/colors';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_B_1XKtrT.mjs';
/* empty css                                      */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Eventos = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", ' <script type="module" src="/src/pages/admin/eventos.client.ts"><\/script> '])), renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Eventos - Club del Meta", "active": "eventos", "data-astro-cid-sdgivehk": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="panel" data-astro-cid-sdgivehk> <header class="panel__header" data-astro-cid-sdgivehk> <div data-astro-cid-sdgivehk> <p class="eyebrow" data-astro-cid-sdgivehk>Administración</p> <h1 data-astro-cid-sdgivehk>Eventos</h1> <p class="muted" data-astro-cid-sdgivehk>Gestiona los eventos que aparecen en la página pública. Puedes crear, editar y eliminar eventos con imágenes.</p> </div> <div class="actions" data-astro-cid-sdgivehk> <button id="btnNuevoEvento" class="btn primary" data-astro-cid-sdgivehk>+ Nuevo Evento</button> </div> </header> <!-- Filtros --> <section class="card filters-card" data-astro-cid-sdgivehk> <div class="filters" data-astro-cid-sdgivehk> <label class="filter-item" data-astro-cid-sdgivehk> <span class="filter-label" data-astro-cid-sdgivehk>Salón</span> <select id="filtroEspacio" class="filter-select" data-astro-cid-sdgivehk> <option value="" data-astro-cid-sdgivehk>Todos los salones</option> </select> </label> <div class="filter-stats" data-astro-cid-sdgivehk> <span id="totalEventos" class="filter-count" data-astro-cid-sdgivehk>0 eventos</span> </div> </div> </section> <!-- Lista de eventos --> <section class="card" data-astro-cid-sdgivehk> <div id="eventosList" class="posts-list" data-astro-cid-sdgivehk> <div class="placeholder" data-astro-cid-sdgivehk>Cargando eventos...</div> </div> <!-- Paginación --> <div id="paginationContainer" data-astro-cid-sdgivehk></div> </section> </section>  <div id="confirmModal" class="modal-overlay hidden" data-astro-cid-sdgivehk> <div class="modal-confirm" data-astro-cid-sdgivehk> <div class="modal-confirm__icon" data-astro-cid-sdgivehk> <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-sdgivehk> <circle cx="12" cy="12" r="10" data-astro-cid-sdgivehk></circle> <line x1="15" y1="9" x2="9" y2="15" data-astro-cid-sdgivehk></line> <line x1="9" y1="9" x2="15" y2="15" data-astro-cid-sdgivehk></line> </svg> </div> <h3 class="modal-confirm__title" data-astro-cid-sdgivehk>¿Eliminar evento?</h3> <p class="modal-confirm__message" data-astro-cid-sdgivehk>Esta acción no se puede deshacer. El evento será eliminado permanentemente.</p> <div class="modal-confirm__actions" data-astro-cid-sdgivehk> <button id="btnCancelarEliminar" class="btn ghost" data-astro-cid-sdgivehk>Cancelar</button> <button id="btnConfirmarEliminar" class="btn danger" data-astro-cid-sdgivehk>Eliminar</button> </div> </div> </div>  <div id="toastContainer" class="toast-container" data-astro-cid-sdgivehk></div> ` }));
}, "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/admin/eventos.astro", void 0);

const $$file = "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/admin/eventos.astro";
const $$url = "/admin/eventos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Eventos,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
