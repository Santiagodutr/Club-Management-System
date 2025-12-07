import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute } from '../chunks/astro/server_-MRgVDm6.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CNFYT2Sv.mjs';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

const $$Salones = createComponent(async ($$result, $$props, $$slots) => {
  const API_URL = "http://localhost:3333";
  let salonesData = [];
  try {
    const response = await fetch(`${API_URL}/api/espacios`);
    const result = await response.json();
    if (result.success && result.data) {
      salonesData = result.data.map((espacio) => ({
        id: espacio.id,
        nombre: espacio.nombre,
        slug: espacio.slug,
        subtitulo: espacio.subtitulo || "",
        descripcionCorta: espacio.descripcion || "",
        capacidad: {
          minima: espacio.capacidad_minima || 0,
          maxima: espacio.capacidad_maxima || 0
        },
        imagenes: espacio.imagenes || [],
        precioDesde: espacio.precio_desde || "Consultar",
        destacado: espacio.destacado || false
      }));
    }
  } catch (error) {
    console.error("Error cargando espacios:", error);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Nuestros Salones - Club del Meta", "data-astro-cid-b2bobajy": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="salones" data-astro-cid-b2bobajy> <header class="salones__header" data-astro-cid-b2bobajy> <h1 data-astro-cid-b2bobajy>Nuestros Salones</h1> <p data-astro-cid-b2bobajy>
Descubre los espacios únicos del Club del Meta. Cada salón tiene su propia personalidad 
        y está diseñado para hacer de tu evento una experiencia memorable.
</p> </header> <div class="salones-grid" data-astro-cid-b2bobajy> ${salonesData.map((salon) => renderTemplate`<article class="salon-card"${addAttribute(salon.destacado, "data-destacado")}${addAttribute(`background-image: url(${salon.imagenes[0]?.url || "/src/assets/millanura.jpg"})`, "style")} data-astro-cid-b2bobajy> <div class="salon-card__overlay" data-astro-cid-b2bobajy> <div class="salon-card__header" data-astro-cid-b2bobajy> ${salon.destacado && renderTemplate`<span class="salon-card__destacado" data-astro-cid-b2bobajy>Destacado</span>`} <span class="salon-card__capacidad" data-astro-cid-b2bobajy> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-b2bobajy> <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" data-astro-cid-b2bobajy></path> <circle cx="9" cy="7" r="4" data-astro-cid-b2bobajy></circle> <path d="M23 21v-2a4 4 0 0 0-3-3.87" data-astro-cid-b2bobajy></path> <path d="M16 3.13a4 4 0 0 1 0 7.75" data-astro-cid-b2bobajy></path> </svg> ${salon.capacidad.minima} - ${salon.capacidad.maxima} personas
</span> <h2 data-astro-cid-b2bobajy>${salon.nombre}</h2> </div> <p class="salon-card__subtitulo" data-astro-cid-b2bobajy>${salon.subtitulo}</p> <p class="salon-card__descripcion" data-astro-cid-b2bobajy>${salon.descripcionCorta}</p> <div class="salon-card__footer" data-astro-cid-b2bobajy> <span class="salon-card__precio" data-astro-cid-b2bobajy>Desde ${salon.precioDesde}</span> <a${addAttribute(`/salones/${salon.slug}`, "href")} class="salon-card__btn" data-astro-cid-b2bobajy>
Ver más detalles
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-b2bobajy> <line x1="5" y1="12" x2="19" y2="12" data-astro-cid-b2bobajy></line> <polyline points="12 5 19 12 12 19" data-astro-cid-b2bobajy></polyline> </svg> </a> </div> </div> </article>`)} </div> </section> ` })} `;
}, "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/salones.astro", void 0);
const $$file = "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/salones.astro";
const $$url = "/salones";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Salones,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
