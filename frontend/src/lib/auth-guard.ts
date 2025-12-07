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

// Setup auto-refresh del token cada 4 minutos
export async function setupAutoTokenRefresh() {
  try {
    // Importar dinámicamente para evitar problemas circulares
    const { getFreshToken } = await import('./auth')
    
    // Verificar y refrescar token inmediatamente
    const initialToken = await getFreshToken()
    if (!initialToken) {
      console.warn('[Auto Refresh] No se pudo obtener token inicial')
      return
    }
    
    console.log('[Auto Refresh] Token refresh configurado (cada 4 minutos)')
    
    // Configurar intervalo de refresco cada 4 minutos
    setInterval(async () => {
      console.log('[Auto Refresh] Verificando token...')
      const token = await getFreshToken()
      if (!token) {
        console.warn('[Auto Refresh] Token expiró y no se pudo refrescar')
        // No redirigir aquí, dejar que el interceptor lo maneje
      } else {
        console.log('[Auto Refresh] Token válido')
      }
    }, 240000) // 4 minutos = 240000 ms
  } catch (error) {
    console.error('[Auto Refresh] Error configurando auto-refresh:', error)
  }
}

// NO inicializar automáticamente - dejar que AdminLayout lo haga explícitamente
// Esto evita problemas de timing con el almacenamiento del token después del login
