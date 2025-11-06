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
