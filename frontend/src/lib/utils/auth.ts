/**
 * Obtiene el token de autenticación desde localStorage
 * Valida que el token exista y tenga formato JWT válido
 * @returns El token JWT o null si no existe o es inválido
 */
export function getAuthToken(): string | null {
  try {
    const authData = localStorage.getItem('adminAuth')
    if (!authData) return null
    
    const parsed = JSON.parse(authData)
    const token = parsed?.token
    
    // Validar que el token existe y tiene formato JWT básico (3 partes)
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      console.warn('[Auth] Token inválido o corrupto en localStorage')
      return null
    }
    
    return token
  } catch (error) {
    console.error('[Auth] Error al obtener token:', error)
    return null
  }
}

/**
 * Verifica si hay un token válido, si no redirige al login
 * @returns El token JWT si es válido
 */
export function requireAuth(): string {
  const token = getAuthToken()
  if (!token) {
    console.warn('[Auth] No hay token válido, redirigiendo al login')
    window.location.href = '/admin/login'
    throw new Error('No authenticated')
  }
  return token
}
