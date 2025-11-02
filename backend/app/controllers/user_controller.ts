import type { HttpContext } from '@adonisjs/core/http'

export default class UserController {
  public async me({ request, response }: HttpContext) {
    if (!request.user) {
      return response.unauthorized({ message: 'No autorizado' })
    }

    return response.ok({
      message: 'Usuario autenticado',
      user: request.user,
    })
  }
}
