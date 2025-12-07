import { c as createComponent, a as createAstro, r as renderTemplate, g as defineScriptVars, d as renderComponent, m as maybeRenderHead, b as addAttribute, u as unescapeHTML } from '../../chunks/astro/server_-MRgVDm6.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout, a as $$Navbar } from '../../chunks/BaseLayout_CNFYT2Sv.mjs';
import { marked } from 'marked';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const prerender = true;
async function getStaticPaths() {
  const API_URL = "http://localhost:3333";
  try {
    const response = await fetch(`${API_URL}/api/espacios`);
    const result = await response.json();
    if (!result.success || !result.data) {
      console.error("Error fetching espacios:", result);
      return [];
    }
    return result.data.filter((espacio) => espacio.slug).map((espacio) => ({
      params: { slug: espacio.slug },
      props: { espacio }
    }));
  } catch (error) {
    console.error("Error en getStaticPaths:", error);
    return [];
  }
}
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$slug;
  const { slug } = Astro2.params;
  const { espacio } = Astro2.props;
  if (!espacio) {
    return Astro2.redirect("/salones");
  }
  const salon = {
    id: espacio.id,
    nombre: espacio.nombre,
    slug: espacio.slug,
    subtitulo: espacio.subtitulo || "",
    descripcionCorta: espacio.descripcion || "",
    descripcionCompleta: espacio.descripcion_completa ? marked.parse(espacio.descripcion_completa) : "",
    caracteristicas: espacio.caracteristicas || [],
    serviciosIncluidos: espacio.servicios_incluidos || [],
    capacidad: {
      minima: espacio.capacidad_minima || 0,
      maxima: espacio.capacidad_maxima || 0
    },
    dimensiones: espacio.area_m2 ? `${espacio.area_m2} m²` : "Consultar",
    imagenes: espacio.imagenes || [],
    horarioDisponible: espacio.horario_disponible || "Consultar",
    precioDesde: espacio.precio_desde || "Consultar",
    destacado: espacio.destacado || false,
    fechaActualizacion: espacio.contenido_actualizado_at || (/* @__PURE__ */ new Date()).toISOString()
  };
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", "\n  // Lightbox functionality\n  const modal = document.getElementById('imageModal');\n  const modalImg = modal?.querySelector('.modal-image');\n  const galleryItems = document.querySelectorAll('.gallery-item');\n  let currentIndex = 0;\n\n  function openModal(index) {\n    currentIndex = index;\n    if (modal && modalImg) {\n      modalImg.src = imagenes[currentIndex].url;\n      modalImg.alt = imagenes[currentIndex].alt;\n      modal.classList.add('active');\n      modal.setAttribute('aria-hidden', 'false');\n      document.body.style.overflow = 'hidden';\n    }\n  }\n\n  function closeModal() {\n    if (modal) {\n      modal.classList.remove('active');\n      modal.setAttribute('aria-hidden', 'true');\n      document.body.style.overflow = '';\n    }\n  }\n\n  function navigate(direction) {\n    currentIndex = (currentIndex + direction + imagenes.length) % imagenes.length;\n    if (modalImg) {\n      modalImg.src = imagenes[currentIndex].url;\n      modalImg.alt = imagenes[currentIndex].alt;\n    }\n  }\n\n  galleryItems.forEach((item, index) => {\n    item.addEventListener('click', () => openModal(index));\n    item.addEventListener('keypress', (e) => {\n      if (e.key === 'Enter') openModal(index);\n    });\n  });\n\n  modal?.querySelector('.modal-close')?.addEventListener('click', closeModal);\n  modal?.querySelector('.modal-prev')?.addEventListener('click', () => navigate(-1));\n  modal?.querySelector('.modal-next')?.addEventListener('click', () => navigate(1));\n\n  modal?.addEventListener('click', (e) => {\n    if (e.target === modal) closeModal();\n  });\n\n  document.addEventListener('keydown', (e) => {\n    if (!modal?.classList.contains('active')) return;\n    if (e.key === 'Escape') closeModal();\n    if (e.key === 'ArrowLeft') navigate(-1);\n    if (e.key === 'ArrowRight') navigate(1);\n  });\n})();</script> "])), renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${salon.nombre} - Club del Meta`, "hideNavbar": true, "fullWidth": true, "data-astro-cid-55xu6jfp": true }, { "default": async ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="salon-hero" data-astro-cid-55xu6jfp> <div class="salon-hero__background"${addAttribute(`background-image: linear-gradient(rgba(4, 14, 32, 0.6), rgba(4, 14, 32, 0.8)), url(${salon.imagenes[0]?.url || "/src/assets/millanura.jpg"})`, "style")} data-astro-cid-55xu6jfp></div> <div class="navbar-wrapper" data-astro-cid-55xu6jfp> ${renderComponent($$result2, "Navbar", $$Navbar, { "data-astro-cid-55xu6jfp": true })} </div> <div class="salon-hero__content" data-astro-cid-55xu6jfp> ${salon.destacado && renderTemplate`<span class="salon-hero__destacado" data-astro-cid-55xu6jfp>Salón Destacado</span>`} <h1 data-astro-cid-55xu6jfp>${salon.nombre}</h1> <p class="salon-hero__subtitulo" data-astro-cid-55xu6jfp>${salon.subtitulo}</p> </div> </section>  <section class="salon-content-section" data-astro-cid-55xu6jfp> <div class="salon-content" data-astro-cid-55xu6jfp> <!-- Sidebar con información rápida --> <aside class="salon-sidebar" data-astro-cid-55xu6jfp> <a href="/salones" class="back-button" data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <line x1="19" y1="12" x2="5" y2="12" data-astro-cid-55xu6jfp></line> <polyline points="12 19 5 12 12 5" data-astro-cid-55xu6jfp></polyline> </svg>
Volver a Salones
</a> <div class="salon-info-card" data-astro-cid-55xu6jfp> <h3 data-astro-cid-55xu6jfp>Información Rápida</h3> <div class="info-item" data-astro-cid-55xu6jfp> <div class="info-item__icon" data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" data-astro-cid-55xu6jfp></path> <circle cx="9" cy="7" r="4" data-astro-cid-55xu6jfp></circle> <path d="M23 21v-2a4 4 0 0 0-3-3.87" data-astro-cid-55xu6jfp></path> <path d="M16 3.13a4 4 0 0 1 0 7.75" data-astro-cid-55xu6jfp></path> </svg> </div> <div class="info-item__content" data-astro-cid-55xu6jfp> <span class="info-item__label" data-astro-cid-55xu6jfp>Capacidad</span> <span class="info-item__value" data-astro-cid-55xu6jfp>${salon.capacidad.minima} - ${salon.capacidad.maxima} personas</span> </div> </div> <div class="info-item" data-astro-cid-55xu6jfp> <div class="info-item__icon" data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <rect x="3" y="3" width="18" height="18" rx="2" ry="2" data-astro-cid-55xu6jfp></rect> <line x1="3" y1="9" x2="21" y2="9" data-astro-cid-55xu6jfp></line> <line x1="9" y1="21" x2="9" y2="9" data-astro-cid-55xu6jfp></line> </svg> </div> <div class="info-item__content" data-astro-cid-55xu6jfp> <span class="info-item__label" data-astro-cid-55xu6jfp>Dimensiones</span> <span class="info-item__value" data-astro-cid-55xu6jfp>${salon.dimensiones}</span> </div> </div> <div class="info-item info-item--price" data-astro-cid-55xu6jfp> <div class="info-item__icon" data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <line x1="12" y1="1" x2="12" y2="23" data-astro-cid-55xu6jfp></line> <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" data-astro-cid-55xu6jfp></path> </svg> </div> <div class="info-item__content" data-astro-cid-55xu6jfp> <span class="info-item__label" data-astro-cid-55xu6jfp>Precio desde</span> <span class="info-item__value info-item__value--price" data-astro-cid-55xu6jfp>${salon.precioDesde}</span> </div> </div> </div> <a${addAttribute(`/obtener-cotizacion?salon=${encodeURIComponent(salon.nombre)}`, "href")} class="cta-button" data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <rect x="3" y="4" width="18" height="18" rx="2" ry="2" data-astro-cid-55xu6jfp></rect> <line x1="16" y1="2" x2="16" y2="6" data-astro-cid-55xu6jfp></line> <line x1="8" y1="2" x2="8" y2="6" data-astro-cid-55xu6jfp></line> <line x1="3" y1="10" x2="21" y2="10" data-astro-cid-55xu6jfp></line> </svg>
Solicitar Cotización
</a> <p class="sidebar-updated" data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" data-astro-cid-55xu6jfp></path> <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" data-astro-cid-55xu6jfp></path> </svg>
Actualizado: ${new Date(salon.fechaActualizacion).toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })} </p> </aside> <!-- Contenido del Blog --> <main class="salon-main" data-astro-cid-55xu6jfp> <!-- Galería de Imágenes --> <section class="salon-gallery" data-astro-cid-55xu6jfp> <h2 data-astro-cid-55xu6jfp>Galería</h2> <div class="gallery-grid" data-astro-cid-55xu6jfp> ${salon.imagenes.map((imagen, index) => renderTemplate`<div${addAttribute(`gallery-item ${index === 0 ? "gallery-item--main" : ""}`, "class")}${addAttribute(index, "data-index")} role="button" tabindex="0" data-astro-cid-55xu6jfp> <img${addAttribute(imagen.url, "src")}${addAttribute(imagen.alt, "alt")} loading="lazy" data-astro-cid-55xu6jfp> <div class="gallery-item__overlay" data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <circle cx="11" cy="11" r="8" data-astro-cid-55xu6jfp></circle> <line x1="21" y1="21" x2="16.65" y2="16.65" data-astro-cid-55xu6jfp></line> <line x1="11" y1="8" x2="11" y2="14" data-astro-cid-55xu6jfp></line> <line x1="8" y1="11" x2="14" y2="11" data-astro-cid-55xu6jfp></line> </svg> </div> </div>`)} </div> </section> <!-- Descripción Completa --> <section class="salon-description" data-astro-cid-55xu6jfp> <h2 data-astro-cid-55xu6jfp>Sobre este espacio</h2> <div class="description-content" data-astro-cid-55xu6jfp>${unescapeHTML(salon.descripcionCompleta)}</div> </section> <!-- Características --> <section class="salon-features" data-astro-cid-55xu6jfp> <h2 data-astro-cid-55xu6jfp>Características</h2> <ul class="features-list" data-astro-cid-55xu6jfp> ${salon.caracteristicas.map((caracteristica) => renderTemplate`<li data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <polyline points="20 6 9 17 4 12" data-astro-cid-55xu6jfp></polyline> </svg> ${caracteristica} </li>`)} </ul> </section> <!-- Servicios Incluidos --> <section class="salon-services" data-astro-cid-55xu6jfp> <h2 data-astro-cid-55xu6jfp>Servicios Incluidos</h2> <ul class="services-list" data-astro-cid-55xu6jfp> ${salon.serviciosIncluidos.map((servicio) => renderTemplate`<li data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" data-astro-cid-55xu6jfp></path> <polyline points="22 4 12 14.01 9 11.01" data-astro-cid-55xu6jfp></polyline> </svg> ${servicio} </li>`)} </ul> </section> <!-- CTA Final --> <section class="salon-cta" data-astro-cid-55xu6jfp> <div class="cta-card" data-astro-cid-55xu6jfp> <h3 data-astro-cid-55xu6jfp>¿Listo para reservar ${salon.nombre}?</h3> <p data-astro-cid-55xu6jfp>Nuestro equipo está disponible para ayudarte a planificar tu evento perfecto.</p> <div class="cta-actions" data-astro-cid-55xu6jfp> <a${addAttribute(`/obtener-cotizacion?salon=${encodeURIComponent(salon.nombre)}`, "href")} class="cta-primary" data-astro-cid-55xu6jfp>
Solicitar Cotización
</a> <a href="/contacto" class="cta-secondary" data-astro-cid-55xu6jfp>
Contactar
</a> </div> </div> </section> </main> </div> </section>  <div class="image-modal" id="imageModal" role="dialog" aria-hidden="true" data-astro-cid-55xu6jfp> <button class="modal-close" aria-label="Cerrar" data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <line x1="18" y1="6" x2="6" y2="18" data-astro-cid-55xu6jfp></line> <line x1="6" y1="6" x2="18" y2="18" data-astro-cid-55xu6jfp></line> </svg> </button> <img src="" alt="" class="modal-image" data-astro-cid-55xu6jfp> <div class="modal-nav" data-astro-cid-55xu6jfp> <button class="modal-prev" aria-label="Anterior" data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <polyline points="15 18 9 12 15 6" data-astro-cid-55xu6jfp></polyline> </svg> </button> <button class="modal-next" aria-label="Siguiente" data-astro-cid-55xu6jfp> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-55xu6jfp> <polyline points="9 18 15 12 9 6" data-astro-cid-55xu6jfp></polyline> </svg> </button> </div> </div> ` }), defineScriptVars({ imagenes: salon.imagenes }));
}, "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/salones/[slug].astro", void 0);
const $$file = "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/salones/[slug].astro";
const $$url = "/salones/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  getStaticPaths,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
