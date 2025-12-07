// Auth Guard - Protección global para páginas admin
export function checkAuthOnLoad() {
  // Solo ejecutar en páginas admin (excluyendo login)
  if (!window.location.pathname.startsWith('/admin')) return
  if (window.location.pathname === '/admin/login') return

  const auth = localStorage.getItem('adminAuth')
  
  if (!auth) {
    console.warn('[Auth Guard] No hay sesión, redirigiendo al login')
    window.location.href = '/admin/login'
    return
  }

  try {
    const authData = JSON.parse(auth)
    
    // Verificar que el token existe y es válido
    if (!authData.token || !authData.isAuthenticated) {
      console.warn('[Auth Guard] Token inválido o sesión no autenticada, redirigiendo al login')
      localStorage.removeItem('adminAuth')
      window.location.href = '/admin/login'
      return
    }

    // Verificar si el token está expirado (si tiene expiresAt en formato Unix timestamp)
    if (authData.expiresAt) {
      const now = Math.floor(Date.now() / 1000) // Unix timestamp en segundos
      
      if (now >= authData.expiresAt) {
        console.warn('[Auth Guard] Token expirado, redirigiendo al login')
        localStorage.removeItem('adminAuth')
        window.location.href = '/admin/login'
        return
      }
    }

  } catch (e) {
    console.error('[Auth Guard] Error validando sesión:', e)
    localStorage.removeItem('adminAuth')
    window.location.href = '/admin/login'
  }
}

// Interceptor global para manejar 401 en cualquier fetch
export function setupGlobalAuthInterceptor() {
  // Guardar el fetch original
  const originalFetch = window.fetch

  // Sobrescribir fetch global
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args)
      
      // Si es 401 y estamos en admin (pero no en login), limpiar y redirigir
      if (response.status === 401 && 
          window.location.pathname.startsWith('/admin') && 
          window.location.pathname !== '/admin/login') {
        
        console.warn('[Auth Interceptor] Respuesta 401 detectada, sesión expirada')
        localStorage.removeItem('adminAuth')
        window.location.href = '/admin/login'
      }
      
      return response
    } catch (error) {
      throw error
    }
  }
}

// NO inicializar automáticamente - dejar que AdminLayout lo haga explícitamente
// Esto evita problemas de timing con el almacenamiento del token después del login
