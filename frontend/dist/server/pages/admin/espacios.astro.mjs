import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_-MRgVDm6.mjs';
import 'kleur/colors';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_DjiJ37gs.mjs';
/* empty css                                       */
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Espacios = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Espacios - Club del Meta", "active": "espacios", "data-astro-cid-n2trqdq5": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="panel" data-astro-cid-n2trqdq5> <header class="panel__header" data-astro-cid-n2trqdq5> <div data-astro-cid-n2trqdq5> <p class="eyebrow" data-astro-cid-n2trqdq5>Administración</p> <h1 data-astro-cid-n2trqdq5>Espacios</h1> <p class="muted" data-astro-cid-n2trqdq5>Gestiona los salones del club: edita información, imágenes, disposiciones y precios.</p> </div> <div class="actions" data-astro-cid-n2trqdq5> <button id="btnRefrescarEspacios" class="btn secondary" data-astro-cid-n2trqdq5>Refrescar</button> <button id="btnPublicarCambios" class="btn" style="background: #16a34a; color: white; display: none;" data-astro-cid-n2trqdq5>Publicar Cambios</button> <button id="btnNuevoEspacio" class="btn primary" data-astro-cid-n2trqdq5>+ Nuevo Salón</button> </div> </header> <div class="grid" data-astro-cid-n2trqdq5> <section class="card" data-astro-cid-n2trqdq5> <div class="card__header" data-astro-cid-n2trqdq5> <div data-astro-cid-n2trqdq5> <p class="eyebrow" data-astro-cid-n2trqdq5>Salones</p> <h2 data-astro-cid-n2trqdq5>Lista de espacios</h2> </div> </div> <div id="espaciosList" class="espacios-list" data-astro-cid-n2trqdq5> <div class="placeholder" data-astro-cid-n2trqdq5>Cargando espacios...</div> </div> </section> </div> </section>  <div id="confirmModal" class="modal-overlay hidden" data-astro-cid-n2trqdq5> <div class="modal-confirm" data-astro-cid-n2trqdq5> <div class="modal-confirm__icon" data-astro-cid-n2trqdq5> <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-n2trqdq5> <circle cx="12" cy="12" r="10" data-astro-cid-n2trqdq5></circle> <line x1="15" y1="9" x2="9" y2="15" data-astro-cid-n2trqdq5></line> <line x1="9" y1="9" x2="15" y2="15" data-astro-cid-n2trqdq5></line> </svg> </div> <h3 class="modal-confirm__title" data-astro-cid-n2trqdq5>¿Eliminar espacio?</h3> <p class="modal-confirm__message" data-astro-cid-n2trqdq5>Esta acción no se puede deshacer. El espacio <strong id="espacioEliminarNombre" data-astro-cid-n2trqdq5></strong> será eliminado permanentemente con todas sus configuraciones.</p> <div class="modal-confirm__actions" data-astro-cid-n2trqdq5> <button id="btnCancelarEliminar" class="btn ghost" data-astro-cid-n2trqdq5>Cancelar</button> <button id="btnConfirmarEliminar" class="btn danger" data-astro-cid-n2trqdq5>Eliminar</button> </div> </div> </div>  <div id="publicarModal" class="modal-overlay hidden" data-astro-cid-n2trqdq5> <div class="modal-publicar" data-astro-cid-n2trqdq5> <h3 class="modal-publicar__title" data-astro-cid-n2trqdq5>Publicar Cambios</h3> <div class="modal-publicar__info" data-astro-cid-n2trqdq5> <p data-astro-cid-n2trqdq5><strong data-astro-cid-n2trqdq5>✓</strong> Esto actualizará el sitio web público con todos los cambios realizados.</p> <p data-astro-cid-n2trqdq5><strong data-astro-cid-n2trqdq5>⏱️</strong> El proceso toma 2-3 minutos y el sitio no se cae durante la publicación.</p> </div> <div id="mensajePublicar" class="modal-publicar__mensaje hidden" data-astro-cid-n2trqdq5></div> <div class="modal-publicar__actions" data-astro-cid-n2trqdq5> <button id="btnCancelarPublicar" class="btn ghost" data-astro-cid-n2trqdq5>Cancelar</button> <button id="btnConfirmarPublicar" class="btn" style="background: #16a34a; color: white;" data-astro-cid-n2trqdq5>Publicar Ahora</button> </div> </div> </div> ` })}  `;
}, "C:/Club-Management-System/frontend/src/pages/admin/espacios.astro", void 0);

const $$file = "C:/Club-Management-System/frontend/src/pages/admin/espacios.astro";
const $$url = "/admin/espacios";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Espacios,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
