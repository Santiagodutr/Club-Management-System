import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_-MRgVDm6.mjs';
import 'kleur/colors';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_DjiJ37gs.mjs';
/* empty css                                       */
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Reservas = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Reservas - Club del Meta", "active": "reservas", "data-astro-cid-vhyo6aks": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="panel" data-astro-cid-vhyo6aks> <header class="panel__header" data-astro-cid-vhyo6aks> <div data-astro-cid-vhyo6aks> <p class="eyebrow" data-astro-cid-vhyo6aks>Administración</p> <h1 data-astro-cid-vhyo6aks>Reservas</h1> <p class="muted" data-astro-cid-vhyo6aks>Gestiona cotizaciones, confirma reservas (bloqueo automático del calendario) y controla pagos.</p> </div> </header> <section class="card card--stretch" data-astro-cid-vhyo6aks> <div class="card__header" data-astro-cid-vhyo6aks> <div data-astro-cid-vhyo6aks> <p id="eyebrowVista" class="eyebrow" data-astro-cid-vhyo6aks>Calendario</p> <h2 data-astro-cid-vhyo6aks>Cotizaciones y Reservas</h2> </div> <div class="card__header-actions" data-astro-cid-vhyo6aks> <div class="view-toggle" data-astro-cid-vhyo6aks> <button id="btnVistaCalendario" class="view-toggle__btn active" data-view="calendario" data-astro-cid-vhyo6aks> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-vhyo6aks> <rect x="3" y="4" width="18" height="18" rx="2" ry="2" data-astro-cid-vhyo6aks></rect> <line x1="16" y1="2" x2="16" y2="6" data-astro-cid-vhyo6aks></line> <line x1="8" y1="2" x2="8" y2="6" data-astro-cid-vhyo6aks></line> <line x1="3" y1="10" x2="21" y2="10" data-astro-cid-vhyo6aks></line> </svg>
Calendario
</button> <button id="btnVistaLista" class="view-toggle__btn" data-view="lista" data-astro-cid-vhyo6aks> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-vhyo6aks> <line x1="8" y1="6" x2="21" y2="6" data-astro-cid-vhyo6aks></line> <line x1="8" y1="12" x2="21" y2="12" data-astro-cid-vhyo6aks></line> <line x1="8" y1="18" x2="21" y2="18" data-astro-cid-vhyo6aks></line> <line x1="3" y1="6" x2="3.01" y2="6" data-astro-cid-vhyo6aks></line> <line x1="3" y1="12" x2="3.01" y2="12" data-astro-cid-vhyo6aks></line> <line x1="3" y1="18" x2="3.01" y2="18" data-astro-cid-vhyo6aks></line> </svg>
Lista
</button> </div> <div class="filters" data-astro-cid-vhyo6aks> <label data-astro-cid-vhyo6aks>
Estado
<select id="fEstado" data-astro-cid-vhyo6aks> <option value="" data-astro-cid-vhyo6aks>Todos</option> <option value="Pendiente" data-astro-cid-vhyo6aks>Pendiente</option> <option value="Aceptada" data-astro-cid-vhyo6aks>Aceptada</option> <option value="Rechazada" data-astro-cid-vhyo6aks>Rechazada</option> </select> </label> <label data-astro-cid-vhyo6aks>
Pago
<select id="fPago" data-astro-cid-vhyo6aks> <option value="" data-astro-cid-vhyo6aks>Todos</option> <option value="Sin pagar" data-astro-cid-vhyo6aks>Sin pagar</option> <option value="Abonado" data-astro-cid-vhyo6aks>Abonado</option> <option value="Pagado completamente" data-astro-cid-vhyo6aks>Pagado completamente</option> </select> </label> </div> </div> </div> <!-- Vista Calendario --> <div id="vistaCalendario" class="vista-content active" data-astro-cid-vhyo6aks> <div class="calendar" data-astro-cid-vhyo6aks> <div class="calendar__header" data-astro-cid-vhyo6aks> <div class="calendar__nav" data-astro-cid-vhyo6aks> <button id="prevMonth" class="btn ghost" aria-label="Mes anterior" data-astro-cid-vhyo6aks>◀</button> <h3 id="monthLabel" data-astro-cid-vhyo6aks></h3> <button id="nextMonth" class="btn ghost" aria-label="Mes siguiente" data-astro-cid-vhyo6aks>▶</button> </div> <div class="calendar__legend" data-astro-cid-vhyo6aks> <span class="dot dot--event" data-astro-cid-vhyo6aks></span> Cotizaciones/Reservas
</div> </div> <div class="calendar__weekdays" data-astro-cid-vhyo6aks> <span data-astro-cid-vhyo6aks>Lun</span><span data-astro-cid-vhyo6aks>Mar</span><span data-astro-cid-vhyo6aks>Mié</span><span data-astro-cid-vhyo6aks>Jue</span><span data-astro-cid-vhyo6aks>Vie</span><span data-astro-cid-vhyo6aks>Sáb</span><span data-astro-cid-vhyo6aks>Dom</span> </div> <div id="calendarDays" class="calendar__grid" data-astro-cid-vhyo6aks> <div class="placeholder" data-astro-cid-vhyo6aks>Cargando calendario...</div> </div> </div> </div> <!-- Vista Lista --> <div id="vistaLista" class="vista-content" data-astro-cid-vhyo6aks> <div id="listaContainer" class="lista-container" data-astro-cid-vhyo6aks> <div class="placeholder" data-astro-cid-vhyo6aks>Cargando cotizaciones...</div> </div> </div> </section> <section id="detalleDelDia" class="card details" data-astro-cid-vhyo6aks> <div class="card__header" data-astro-cid-vhyo6aks> <div data-astro-cid-vhyo6aks> <p class="eyebrow" data-astro-cid-vhyo6aks>Detalle del día</p> <h2 id="dayTitle" data-astro-cid-vhyo6aks>Selecciona un día</h2> </div> </div> <div id="dayList" class="day-list" data-astro-cid-vhyo6aks> <div class="placeholder" data-astro-cid-vhyo6aks>Elige una fecha en el calendario para ver cotizaciones o reservas.</div> </div> </section> </section> ` })}  `;
}, "C:/Club-Management-System/frontend/src/pages/admin/reservas.astro", void 0);

const $$file = "C:/Club-Management-System/frontend/src/pages/admin/reservas.astro";
const $$url = "/admin/reservas";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Reservas,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
