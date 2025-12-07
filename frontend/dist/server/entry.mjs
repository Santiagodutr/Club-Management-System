import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BKHPV5kC.mjs';
import { manifest } from './manifest_DyfLWeDX.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/espacios/nuevo.astro.mjs');
const _page2 = () => import('./pages/admin/espacios/_id_/editar.astro.mjs');
const _page3 = () => import('./pages/admin/espacios.astro.mjs');
const _page4 = () => import('./pages/admin/eventos/nuevo.astro.mjs');
const _page5 = () => import('./pages/admin/eventos/_id_/editar.astro.mjs');
const _page6 = () => import('./pages/admin/eventos.astro.mjs');
const _page7 = () => import('./pages/admin/login.astro.mjs');
const _page8 = () => import('./pages/admin/panel.astro.mjs');
const _page9 = () => import('./pages/admin/publicar.astro.mjs');
const _page10 = () => import('./pages/admin/reportes.astro.mjs');
const _page11 = () => import('./pages/admin/reservas.astro.mjs');
const _page12 = () => import('./pages/contacto.astro.mjs');
const _page13 = () => import('./pages/eventos.astro.mjs');
const _page14 = () => import('./pages/obtener-cotizacion.astro.mjs');
const _page15 = () => import('./pages/salones/_slug_.astro.mjs');
const _page16 = () => import('./pages/salones.astro.mjs');
const _page17 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/admin/espacios/nuevo.astro", _page1],
    ["src/pages/admin/espacios/[id]/editar.astro", _page2],
    ["src/pages/admin/espacios.astro", _page3],
    ["src/pages/admin/eventos/nuevo.astro", _page4],
    ["src/pages/admin/eventos/[id]/editar.astro", _page5],
    ["src/pages/admin/eventos.astro", _page6],
    ["src/pages/admin/login.astro", _page7],
    ["src/pages/admin/panel.astro", _page8],
    ["src/pages/admin/publicar.astro", _page9],
    ["src/pages/admin/reportes.astro", _page10],
    ["src/pages/admin/reservas.astro", _page11],
    ["src/pages/contacto.astro", _page12],
    ["src/pages/eventos.astro", _page13],
    ["src/pages/obtener-cotizacion.astro", _page14],
    ["src/pages/salones/[slug].astro", _page15],
    ["src/pages/salones.astro", _page16],
    ["src/pages/index.astro", _page17]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/dist/client/",
    "server": "file:///C:/Users/SSierra/Documents/DesarrolloClubElMeta/frontend/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
{
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
