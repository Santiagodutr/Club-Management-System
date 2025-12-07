import { c as createComponent, r as renderTemplate, d as renderComponent, m as maybeRenderHead } from '../../chunks/astro/server_-MRgVDm6.mjs';
import 'kleur/colors';
import { $ as $$AdminLayout } from '../../chunks/AdminLayout_B_1XKtrT.mjs';
/* empty css                                       */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Reportes = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(["", ' <script type="module" src="/src/pages/admin/reportes.client.ts"><\/script> '])), renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Reportes - Club del Meta", "active": "reportes", "data-astro-cid-ligjxvzq": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="dashboard" data-astro-cid-ligjxvzq> <header class="dashboard__header" data-astro-cid-ligjxvzq> <div data-astro-cid-ligjxvzq> <p class="eyebrow" data-astro-cid-ligjxvzq>Analítica</p> <h1 data-astro-cid-ligjxvzq>Reportes de cotizaciones</h1> <p class="muted" data-astro-cid-ligjxvzq>Visión de cotizaciones por estado, mes y participación de salones.</p> </div> <div class="filters" data-astro-cid-ligjxvzq> <label data-astro-cid-ligjxvzq>
Vista
<select id="vistaSelect" data-astro-cid-ligjxvzq> <option value="dia" data-astro-cid-ligjxvzq>Por día</option> <option value="mes" data-astro-cid-ligjxvzq>Por mes</option> <option value="anio" data-astro-cid-ligjxvzq>Por año</option> </select> </label> <label id="monthSelectorWrap" data-astro-cid-ligjxvzq>
Mes
<select id="monthSelect" data-astro-cid-ligjxvzq> <option value="1" data-astro-cid-ligjxvzq>Enero</option> <option value="2" data-astro-cid-ligjxvzq>Febrero</option> <option value="3" data-astro-cid-ligjxvzq>Marzo</option> <option value="4" data-astro-cid-ligjxvzq>Abril</option> <option value="5" data-astro-cid-ligjxvzq>Mayo</option> <option value="6" data-astro-cid-ligjxvzq>Junio</option> <option value="7" data-astro-cid-ligjxvzq>Julio</option> <option value="8" data-astro-cid-ligjxvzq>Agosto</option> <option value="9" data-astro-cid-ligjxvzq>Septiembre</option> <option value="10" data-astro-cid-ligjxvzq>Octubre</option> <option value="11" data-astro-cid-ligjxvzq>Noviembre</option> <option value="12" data-astro-cid-ligjxvzq>Diciembre</option> </select> </label> <label id="yearSelectorWrap" data-astro-cid-ligjxvzq>
Año
<select id="yearSelect" data-astro-cid-ligjxvzq> <option value="" data-astro-cid-ligjxvzq>Cargando...</option> </select> </label> </div> </header> <div class="kpi-grid" data-astro-cid-ligjxvzq> <article class="kpi-card" data-astro-cid-ligjxvzq> <div class="kpi-icon primary" data-astro-cid-ligjxvzq>📈</div> <div data-astro-cid-ligjxvzq> <p class="kpi-label" data-astro-cid-ligjxvzq>Total</p> <p class="kpi-value" id="kpiTotal" data-astro-cid-ligjxvzq>—</p> </div> </article> <article class="kpi-card" data-astro-cid-ligjxvzq> <div class="kpi-icon success" data-astro-cid-ligjxvzq>✅</div> <div data-astro-cid-ligjxvzq> <p class="kpi-label" data-astro-cid-ligjxvzq>Aprobadas</p> <p class="kpi-value" id="kpiAprobadas" data-astro-cid-ligjxvzq>—</p> </div> </article> <article class="kpi-card" data-astro-cid-ligjxvzq> <div class="kpi-icon warning" data-astro-cid-ligjxvzq>⏳</div> <div data-astro-cid-ligjxvzq> <p class="kpi-label" data-astro-cid-ligjxvzq>Pendientes</p> <p class="kpi-value" id="kpiPendientes" data-astro-cid-ligjxvzq>—</p> </div> </article> <article class="kpi-card" data-astro-cid-ligjxvzq> <div class="kpi-icon danger" data-astro-cid-ligjxvzq>✖️</div> <div data-astro-cid-ligjxvzq> <p class="kpi-label" data-astro-cid-ligjxvzq>Rechazadas</p> <p class="kpi-value" id="kpiRechazadas" data-astro-cid-ligjxvzq>—</p> </div> </article> </div> <div class="charts-grid" data-astro-cid-ligjxvzq> <article class="card chart-card" data-astro-cid-ligjxvzq> <header class="card__header" data-astro-cid-ligjxvzq> <div data-astro-cid-ligjxvzq> <p class="eyebrow" data-astro-cid-ligjxvzq>Calendario</p> <h3 id="chartTitle" data-astro-cid-ligjxvzq>Cotizaciones</h3> </div> </header> <div id="calendarGrid" class="calendar-grid" data-astro-cid-ligjxvzq></div> </article> <article class="card chart-card" data-astro-cid-ligjxvzq> <header class="card__header" data-astro-cid-ligjxvzq> <div data-astro-cid-ligjxvzq> <p class="eyebrow" data-astro-cid-ligjxvzq>Participación por salón</p> <h3 data-astro-cid-ligjxvzq>Distribución</h3> </div> <select id="estadoDonutSelect" class="filter-estado" data-astro-cid-ligjxvzq> <option value="todas" data-astro-cid-ligjxvzq>Todas</option> <option value="aceptada" data-astro-cid-ligjxvzq>Aceptadas</option> <option value="pendiente" data-astro-cid-ligjxvzq>Pendientes</option> <option value="rechazada" data-astro-cid-ligjxvzq>Rechazadas</option> </select> </header> <div class="donut-wrap" data-astro-cid-ligjxvzq> <div id="donutChart" class="donut" data-astro-cid-ligjxvzq> <div class="donut-center" data-astro-cid-ligjxvzq> <div class="donut-number" id="donutTotal" data-astro-cid-ligjxvzq>—</div> <div class="donut-label" data-astro-cid-ligjxvzq>total</div> </div> </div> <div id="donutLegend" class="legend" data-astro-cid-ligjxvzq></div> </div> </article> </div> </section> ` }));
}, "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/admin/reportes.astro", void 0);

const $$file = "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/admin/reportes.astro";
const $$url = "/admin/reportes";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Reportes,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
