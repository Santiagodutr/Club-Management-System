import { HttpContext } from '@adonisjs/core/http'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import Env from '#start/env'

const SUPABASE_JWT_ISSUER = `${Env.get('SUPABASE_URL')}/auth/v1`
const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_JWT_ISSUER}/.well-known/jwks.json`))

export default class SupabaseAuthMiddleware {
  public async handle(ctx: HttpContext, next: () => Promise<void>) {
    const { request, response } = ctx
    const authHeader = request.header('Authorization')

    if (!authHeader) {
      return response.unauthorized({ message: 'Missing Authorization header' })
    }

    const token = authHeader.replace('Bearer ', '').trim()

    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: SUPABASE_JWT_ISSUER,
      })

      console.log('[SupabaseAuth] Verified JWT payload:', payload)

      ctx.request.user = {
        id: payload.sub as string,
        email: payload.email as string | undefined,
        role: payload.role as string | undefined,
        aud: payload.aud as string | undefined,
      } as any

      await next()
    } catch (error) {
      console.error('[SupabaseAuth] JWT verification failed:', error)
      return response.unauthorized({ message: 'Invalid or expired token' })
    }
  }
}
