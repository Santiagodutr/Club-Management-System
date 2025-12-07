import { c as createComponent, d as renderComponent, r as renderTemplate, m as maybeRenderHead, b as addAttribute, u as unescapeHTML, F as Fragment } from '../chunks/astro/server_-MRgVDm6.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CNFYT2Sv.mjs';
import { marked } from 'marked';
/* empty css                                   */
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$Eventos = createComponent(async ($$result, $$props, $$slots) => {
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  const API_URL = "http://localhost:3333";
  let posts = [];
  try {
    const postsResponse = await fetch(`${API_URL}/api/salon-posts`);
    const postsResult = await postsResponse.json();
    console.log("[EVENTOS DEBUG] Response completo:", JSON.stringify(postsResult, null, 2));
    if (postsResult.success && postsResult.data) {
      console.log("[EVENTOS DEBUG] Número de posts:", postsResult.data.length);
      posts = postsResult.data.map((post) => {
        console.log("[EVENTOS DEBUG] Post:", post.id, "imagenes:", post.imagenes, "tipo:", typeof post.imagenes);
        let imagenes = post.imagenes || [];
        const fullContentHtml = marked.parse(post.content || "");
        return {
          id: post.id,
          titulo: post.titulo,
          slug: post.slug,
          preview: fullContentHtml,
          content: fullContentHtml,
          imagenes,
          publishedAt: post.publishedAt || post.published_at,
          espacioNombre: post.espacio?.nombre || "Club del Meta"
        };
      });
      console.log("[EVENTOS DEBUG] Posts procesados:", posts.length);
    }
  } catch (error) {
    console.error("[EVENTOS DEBUG] Error cargando eventos:", error);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Eventos Realizados - Club del Meta", "data-astro-cid-zk2dtgpv": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="eventos" data-astro-cid-zk2dtgpv> <header class="eventos__header" data-astro-cid-zk2dtgpv> <h1 data-astro-cid-zk2dtgpv>Nuestros Eventos</h1> <p data-astro-cid-zk2dtgpv>
Revive los momentos más especiales que han tenido lugar en el Club del Meta.
        Cada evento cuenta una historia única de celebración y éxito.
</p> </header> <div class="eventos-feed" data-astro-cid-zk2dtgpv> ${posts.length > 0 ? posts.map((post, postIndex) => renderTemplate`<article class="evento-item"${addAttribute(post.id, "data-post-id")} data-astro-cid-zk2dtgpv> <div class="evento-item__header" data-astro-cid-zk2dtgpv> <div class="evento-item__meta" data-astro-cid-zk2dtgpv> <span class="evento-item__salon" data-astro-cid-zk2dtgpv>${post.espacioNombre}</span> <span class="evento-item__separator" data-astro-cid-zk2dtgpv>•</span> <time class="evento-item__date"${addAttribute(post.publishedAt, "datetime")} data-astro-cid-zk2dtgpv> ${(() => {
    try {
      const fecha = new Date(post.publishedAt);
      if (isNaN(fecha.getTime())) {
        return "Fecha no disponible";
      }
      return fecha.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "Fecha no disponible";
    }
  })()} </time> </div> <h2 class="evento-item__title" data-astro-cid-zk2dtgpv>${post.titulo}</h2> </div> ${post.imagenes && post.imagenes.length > 0 && renderTemplate`<div class="evento-item__carousel"${addAttribute(`carousel-${post.id}`, "data-carousel")} data-astro-cid-zk2dtgpv> <div class="carousel-container" data-astro-cid-zk2dtgpv> ${post.imagenes.map((img, imgIndex) => renderTemplate`<div${addAttribute(`carousel-slide ${imgIndex === 0 ? "active" : ""}`, "class")}${addAttribute(imgIndex, "data-slide")} data-astro-cid-zk2dtgpv> <img${addAttribute(img.url, "src")}${addAttribute(img.alt || post.titulo, "alt")}${addAttribute(imgIndex === 0 ? "eager" : "lazy", "loading")} data-astro-cid-zk2dtgpv> </div>`)} </div> ${post.imagenes.length > 1 && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, { "data-astro-cid-zk2dtgpv": true }, { "default": async ($$result3) => renderTemplate` <button class="carousel-btn carousel-btn--prev" aria-label="Imagen anterior" data-astro-cid-zk2dtgpv> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" data-astro-cid-zk2dtgpv> <polyline points="15 18 9 12 15 6" data-astro-cid-zk2dtgpv></polyline> </svg> </button> <button class="carousel-btn carousel-btn--next" aria-label="Siguiente imagen" data-astro-cid-zk2dtgpv> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" data-astro-cid-zk2dtgpv> <polyline points="9 18 15 12 9 6" data-astro-cid-zk2dtgpv></polyline> </svg> </button> <div class="carousel-indicators" data-astro-cid-zk2dtgpv> ${post.imagenes.map((_, idx) => renderTemplate`<button${addAttribute(`indicator ${idx === 0 ? "active" : ""}`, "class")}${addAttribute(idx, "data-slide-to")}${addAttribute(`Ir a imagen ${idx + 1}`, "aria-label")} data-astro-cid-zk2dtgpv></button>`)} </div> ` })}`} </div>`} <div class="evento-item__content" data-astro-cid-zk2dtgpv> <div class="evento-item__preview" data-preview data-astro-cid-zk2dtgpv>${unescapeHTML(post.preview)}</div> <div class="evento-item__body collapsible" data-collapsed="true" data-astro-cid-zk2dtgpv> <div class="collapsible-content" data-astro-cid-zk2dtgpv>${unescapeHTML(post.content)}</div> </div> <button class="ver-mas-btn" data-astro-cid-zk2dtgpv>Ver más</button> </div> </article>`) : renderTemplate`<div class="no-eventos" data-astro-cid-zk2dtgpv> <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-astro-cid-zk2dtgpv> <rect x="3" y="4" width="18" height="18" rx="2" ry="2" data-astro-cid-zk2dtgpv></rect> <line x1="16" y1="2" x2="16" y2="6" data-astro-cid-zk2dtgpv></line> <line x1="8" y1="2" x2="8" y2="6" data-astro-cid-zk2dtgpv></line> <line x1="3" y1="10" x2="21" y2="10" data-astro-cid-zk2dtgpv></line> </svg> <h3 data-astro-cid-zk2dtgpv>Próximamente</h3> <p data-astro-cid-zk2dtgpv>Pronto compartiremos las historias de los eventos más memorables de nuestro club.</p> </div>`} </div> </section>  <div class="image-modal" id="imageModal" role="dialog" aria-hidden="true" data-astro-cid-zk2dtgpv> <button class="modal-close" aria-label="Cerrar" data-astro-cid-zk2dtgpv> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-zk2dtgpv> <line x1="18" y1="6" x2="6" y2="18" data-astro-cid-zk2dtgpv></line> <line x1="6" y1="6" x2="18" y2="18" data-astro-cid-zk2dtgpv></line> </svg> </button> <img src="" alt="" class="modal-image" data-astro-cid-zk2dtgpv> <div class="modal-nav" data-astro-cid-zk2dtgpv> <button class="modal-prev" aria-label="Anterior" data-astro-cid-zk2dtgpv> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-zk2dtgpv> <polyline points="15 18 9 12 15 6" data-astro-cid-zk2dtgpv></polyline> </svg> </button> <button class="modal-next" aria-label="Siguiente" data-astro-cid-zk2dtgpv> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" data-astro-cid-zk2dtgpv> <polyline points="9 18 15 12 9 6" data-astro-cid-zk2dtgpv></polyline> </svg> </button> </div> </div> ` })}  `;
}, "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/eventos.astro", void 0);
const $$file = "C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/src/pages/eventos.astro";
const $$url = "/eventos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Eventos,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
