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
