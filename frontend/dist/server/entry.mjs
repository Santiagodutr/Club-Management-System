import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_C8RNJjcv.mjs';
import { manifest } from './manifest_DeSSLjX4.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/espacios/nuevo.astro.mjs');
const _page2 = () => import('./pages/admin/espacios/nuevo.client.astro.mjs');
const _page3 = () => import('./pages/admin/espacios/_id_/editar.astro.mjs');
const _page4 = () => import('./pages/admin/espacios/_id_/editar.client.astro.mjs');
const _page5 = () => import('./pages/admin/espacios.astro.mjs');
const _page6 = () => import('./pages/admin/espacios-lista.client.astro.mjs');
const _page7 = () => import('./pages/admin/espacios.client.astro.mjs');
const _page8 = () => import('./pages/admin/eventos/nuevo.astro.mjs');
const _page9 = () => import('./pages/admin/eventos/nuevo.client.astro.mjs');
const _page10 = () => import('./pages/admin/eventos/_id_/editar.astro.mjs');
const _page11 = () => import('./pages/admin/eventos/_id_/editar.client.astro.mjs');
const _page12 = () => import('./pages/admin/eventos.astro.mjs');
const _page13 = () => import('./pages/admin/eventos.client.astro.mjs');
const _page14 = () => import('./pages/admin/login.astro.mjs');
const _page15 = () => import('./pages/admin/panel.astro.mjs');
const _page16 = () => import('./pages/admin/panel.client.astro.mjs');
const _page17 = () => import('./pages/admin/publicar.astro.mjs');
const _page18 = () => import('./pages/admin/reportes.astro.mjs');
const _page19 = () => import('./pages/admin/reportes.client.astro.mjs');
const _page20 = () => import('./pages/admin/reservas.astro.mjs');
const _page21 = () => import('./pages/admin/reservas.client.astro.mjs');
const _page22 = () => import('./pages/contacto.astro.mjs');
const _page23 = () => import('./pages/eventos.astro.mjs');
const _page24 = () => import('./pages/obtener-cotizacion.astro.mjs');
const _page25 = () => import('./pages/salones/_slug_.astro.mjs');
const _page26 = () => import('./pages/salones.astro.mjs');
const _page27 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/admin/espacios/nuevo.astro", _page1],
    ["src/pages/admin/espacios/nuevo.client.ts", _page2],
    ["src/pages/admin/espacios/[id]/editar.astro", _page3],
    ["src/pages/admin/espacios/[id]/editar.client.ts", _page4],
    ["src/pages/admin/espacios.astro", _page5],
    ["src/pages/admin/espacios-lista.client.ts", _page6],
    ["src/pages/admin/espacios.client.ts", _page7],
    ["src/pages/admin/eventos/nuevo.astro", _page8],
    ["src/pages/admin/eventos/nuevo.client.ts", _page9],
    ["src/pages/admin/eventos/[id]/editar.astro", _page10],
    ["src/pages/admin/eventos/[id]/editar.client.ts", _page11],
    ["src/pages/admin/eventos.astro", _page12],
    ["src/pages/admin/eventos.client.ts", _page13],
    ["src/pages/admin/login.astro", _page14],
    ["src/pages/admin/panel.astro", _page15],
    ["src/pages/admin/panel.client.ts", _page16],
    ["src/pages/admin/publicar.astro", _page17],
    ["src/pages/admin/reportes.astro", _page18],
    ["src/pages/admin/reportes.client.ts", _page19],
    ["src/pages/admin/reservas.astro", _page20],
    ["src/pages/admin/reservas.client.ts", _page21],
    ["src/pages/contacto.astro", _page22],
    ["src/pages/eventos.astro", _page23],
    ["src/pages/obtener-cotizacion.astro", _page24],
    ["src/pages/salones/[slug].astro", _page25],
    ["src/pages/salones.astro", _page26],
    ["src/pages/index.astro", _page27]
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
