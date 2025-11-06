import type { HttpContext } from '@adonisjs/core/http'
import { supabase } from '#services/supabase_service'

export default class AuthController {
  public async register({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password']) as {
      email?: string
      password?: string
    }

    if (!email || !password) {
      return response.badRequest({ message: 'Email y password son requeridos' })
    }

    // Adonis bodyparser ya parsea JSON. Supabase requiere email/password.
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      return response.badRequest({ message: error.message })
    }

    return response.created({
      message: 'Usuario registrado.',
      user: data.user ?? null,
      session: data.session ?? null,
    })
  }

  public async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password']) as {
      email?: string
      password?: string
    }

    if (!email || !password) {
      return response.badRequest({ message: 'Email y password son requeridos' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return response.unauthorized({ message: error.message })
    }

    return response.ok({
      message: 'Inicio de sesión exitoso',
      user: data.user,
      session: data.session,
    })
  }
}
