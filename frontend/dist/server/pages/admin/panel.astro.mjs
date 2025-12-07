import { c as createComponent, m as maybeRenderHead, r as renderTemplate } from '../../chunks/astro/server_-MRgVDm6.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$Panel = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate` ${maybeRenderHead()}<div style="font-family: Inter, system-ui; padding: 2rem; max-width: 720px; margin: 0 auto;"> <h1>Panel movido</h1> <p>El panel ahora está dividido en dos secciones:</p> <ul> <li><a href="/admin/reservas">Reservas</a></li> <li><a href="/admin/espacios">Espacios</a></li> </ul> <p>Serás redirigido automáticamente.</p> </div>`;
}, "C:/Club-Management-System/frontend/src/pages/admin/panel.astro", void 0);

const $$file = "C:/Club-Management-System/frontend/src/pages/admin/panel.astro";
const $$url = "/admin/panel";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Panel,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
