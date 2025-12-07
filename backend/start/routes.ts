/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import { getOpenApiSpec } from '#services/swagger_service'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// Auth routes (temporales para login/registro via backend)
const AuthController = () => import('#controllers/auth_controller')
router.post('/auth/register', [AuthController, 'register'])
router.post('/auth/login', [AuthController, 'login'])

// Ruta protegida: requiere autenticación con Supabase
const UserController = () => import('#controllers/user_controller')
router.get('/me', [UserController, 'me']).use(middleware.auth())

// Admin routes: requieren auth + rol admin
const AdminController = () => import('#controllers/admin_controller')
router.get('/admin/stats', [AdminController, 'stats']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/config/update', [AdminController, 'updateConfig']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.get('/admin/usuarios', [AdminController, 'listUsuarios']).use(middleware.auth()).use(middleware.checkRole('admin'))

// Disponibilidad routes
const DisponibilidadController = () => import('#controllers/disponibilidad_controller')
router.get('/api/disponibilidad/horas', [DisponibilidadController, 'obtenerHorasDisponibles'])

// Cotizaciones routes
const CotizacionController = () => import('#controllers/cotizacion_controller')
router.post('/api/cotizaciones', [CotizacionController, 'crearCotizacion'])
router.get('/api/cotizaciones', [CotizacionController, 'listarCotizaciones'])
router.get('/api/cotizaciones/:id', [CotizacionController, 'mostrarCotizacion'])
router.put('/api/cotizaciones/:id', [CotizacionController, 'actualizarCotizacion'])
router.post('/api/cotizaciones/:id/cerrar', [CotizacionController, 'cerrarCotizacion'])
router.post('/api/cotizaciones/:id/rechazar', [CotizacionController, 'rechazarCotizacion'])
router.post('/api/cotizaciones/:id/registrar-pago', [CotizacionController, 'registrarPagoAdicional'])
router.get('/api/cotizaciones/:id/pdf', [CotizacionController, 'descargarPDF'])
router.post('/api/cotizaciones/:id/enviar-correo', [CotizacionController, 'enviarCorreoPrueba'])

// Horarios routes (admin)
const HorariosController = () => import('#controllers/horarios_controller')
router.get('/admin/horarios', [HorariosController, 'index']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/horarios', [HorariosController, 'crear']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.get('/admin/horarios/:id', [HorariosController, 'mostrar']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.put('/admin/horarios/:id', [HorariosController, 'actualizar']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.put('/admin/horarios/:id/horarios', [HorariosController, 'actualizarHorarios']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/horarios/:id/activar', [HorariosController, 'activar']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/horarios/:id/desactivar', [HorariosController, 'desactivar']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.delete('/admin/horarios/:id', [HorariosController, 'eliminar']).use(middleware.auth()).use(middleware.checkRole('admin'))

// Plantillas PDF routes (admin)
const PlantillasPdfController = () => import('#controllers/plantillas_pdf_controller')
router.get('/admin/plantillas-pdf', [PlantillasPdfController, 'index']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/plantillas-pdf', [PlantillasPdfController, 'crear']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.get('/admin/plantillas-pdf/:id', [PlantillasPdfController, 'mostrar']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.put('/admin/plantillas-pdf/:id', [PlantillasPdfController, 'actualizar']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.delete('/admin/plantillas-pdf/:id', [PlantillasPdfController, 'eliminar']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/plantillas-pdf/:id/activar', [PlantillasPdfController, 'activar']).use(middleware.auth()).use(middleware.checkRole('admin'))

// Socios routes (admin)
const SociosController = () => import('#controllers/socios_controller')
router.get('/admin/socios', [SociosController, 'index']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/socios', [SociosController, 'crear']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.get('/admin/socios/buscar-por-documento', [SociosController, 'buscarPorDocumento']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.get('/admin/socios/:id', [SociosController, 'mostrar']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.put('/admin/socios/:id', [SociosController, 'actualizar']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.delete('/admin/socios/:id', [SociosController, 'eliminar']).use(middleware.auth()).use(middleware.checkRole('admin'))

// Socios búsqueda pública (para cotizaciones)
router.get('/api/socios/buscar', [SociosController, 'buscarPublico'])

// Espacios routes (públicas y admin)
const EspacioController = () => import('#controllers/espacio_controller')
router.get('/api/espacios', [EspacioController, 'index'])
router.get('/api/espacios/simplificado', [EspacioController, 'listarSimplificado'])
router.get('/api/espacios/:espacioId/tarifas', [EspacioController, 'obtenerTarifasEspacio'])
router.get('/api/espacios/:espacioId/configuraciones', [EspacioController, 'obtenerConfiguracionesEspacio'])
router.get('/api/espacios/:id', [EspacioController, 'show'])
router.post('/api/espacios', [EspacioController, 'store']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.put('/api/espacios/:id', [EspacioController, 'update']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.delete('/api/espacios/:id', [EspacioController, 'destroy']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.get('/api/disposiciones', [EspacioController, 'listarDisposiciones'])
router.get('/api/prestaciones', [EspacioController, 'listarPrestaciones'])
router.get('/api/servicios-adicionales', [EspacioController, 'listarPrestaciones'])

// Espacios Públicos (con caché para frontend)
const EspaciosPublicosController = () => import('#controllers/espacios_publicos_controller')
router.get('/api/espacios-publicos', [EspaciosPublicosController, 'index'])
router.get('/api/espacios-publicos/:slug', [EspaciosPublicosController, 'show'])
router.delete('/api/espacios-publicos/cache', [EspaciosPublicosController, 'clearCache']).use(middleware.auth()).use(middleware.checkRole('admin'))

// Salon Posts (Blog) routes - públicas con cache
const SalonPostsController = () => import('#controllers/salon_posts_controller')
router.get('/api/salon-posts', [SalonPostsController, 'index'])
router.get('/api/salon-posts/:slug', [SalonPostsController, 'show'])

// Salon Posts (Blog) routes - admin
router.get('/admin/salon-posts', [SalonPostsController, 'indexAdmin']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/salon-posts', [SalonPostsController, 'store']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.get('/admin/salon-posts/:id', [SalonPostsController, 'showAdmin']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.put('/admin/salon-posts/:id', [SalonPostsController, 'update']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.delete('/admin/salon-posts/:id', [SalonPostsController, 'destroy']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/salon-posts/:id/publish', [SalonPostsController, 'publish']).use(middleware.auth()).use(middleware.checkRole('admin'))

// Espacios Admin routes
const EspaciosAdminController = () => import('#controllers/espacios_admin_controller')
router.get('/admin/espacios', [EspaciosAdminController, 'listarEspacios']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.get('/admin/espacios/:id', [EspaciosAdminController, 'obtenerEspacio']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/espacios', [EspaciosAdminController, 'crearEspacio']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.put('/admin/espacios/:id', [EspaciosAdminController, 'actualizarEspacio']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/espacios/:id/configuraciones', [EspaciosAdminController, 'agregarConfiguracion']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.put('/admin/espacios/:id/configuraciones/:configId', [EspaciosAdminController, 'actualizarConfiguracion']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.delete('/admin/espacios/:id/configuraciones/:configId', [EspaciosAdminController, 'eliminarConfiguracion']).use(middleware.auth()).use(middleware.checkRole('admin'))

// Disposiciones Admin routes
router.get('/admin/disposiciones', [EspaciosAdminController, 'listarDisposiciones']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.post('/admin/disposiciones', [EspaciosAdminController, 'crearDisposicion']).use(middleware.auth()).use(middleware.checkRole('admin'))
router.put('/admin/disposiciones/:id', [EspaciosAdminController, 'actualizarDisposicion']).use(middleware.auth()).use(middleware.checkRole('admin'))

// Webhook para trigger rebuild del frontend
const WebhookController = await import('#controllers/webhook_controller')
router.post('/admin/trigger-rebuild', [WebhookController.default, 'triggerRebuild']).use(middleware.auth()).use(middleware.checkRole('admin'))

// --- API Docs ---
// Sirve el OpenAPI spec en JSON generado desde archivos "solo-docs"
router.get('/openapi.json', async ({ response }) => {
  const spec = getOpenApiSpec()
  return response.json(spec)
})

// UI Redoc sin dependencias locales (desde CDN)
router.get('/docs', async ({ response }) => {
  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>API Docs</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>html,body,#redoc{height:100%;margin:0;}</style>
    </head>
    <body>
      <div id="redoc"></div>
      <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
      <script>Redoc.init('/openapi.json', {}, document.getElementById('redoc'));</script>
    </body>
  </html>`
  return response.header('Content-Type', 'text/html').send(html)
})

// UI Swagger para "Try it out" interactivo
router.get('/docs/swagger', async ({ response }) => {
  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <title>API Docs (Swagger UI)</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
      <style>html,body,#swagger-ui{height:100%;margin:0;}</style>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script>
        window.ui = SwaggerUIBundle({
          url: '/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis],
          layout: 'BaseLayout',
          persistAuthorization: true
        });
      </script>
    </body>
  </html>`
  return response.header('Content-Type', 'text/html').send(html)
})
