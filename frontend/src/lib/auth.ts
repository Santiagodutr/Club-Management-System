import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    user: data.user,
    session: data.session
  }
}

/**
 * Register new user
 */
export async function register(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    user: data.user,
    session: data.session
  }
}

/**
 * Logout current user
 */
export async function logout() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting session:', error)
    return null
  }

  return data.session
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  return data.user
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (authState: AuthState) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback({
      user: session?.user || null,
      session: session || null,
      isAuthenticated: session !== null
    })
  })
}

/**
 * Get fresh access token (refreshes automatically if needed)
 */
export async function getFreshToken(): Promise<string | null> {
  try {
    // Obtener sesión actual (Supabase automáticamente refresca si es necesario)
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[Auth] Error getting session:', error)
      return null
    }
    
    if (!session) {
      console.warn('[Auth] No active session found')
      return null
    }
    
    // Verificar si el token está próximo a expirar (menos de 5 minutos)
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0
    const now = Date.now()
    const timeUntilExpiry = expiresAt - now
    const fiveMinutes = 5 * 60 * 1000
    
    if (timeUntilExpiry < fiveMinutes) {
      console.log('[Auth] Token about to expire, refreshing...')
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error('[Auth] Error refreshing session:', refreshError)
        return null
      }
      
      if (refreshData.session) {
        console.log('[Auth] Token refreshed successfully')
        
        // Actualizar token en localStorage para que lo use api.ts
        const adminAuth = localStorage.getItem('adminAuth')
        if (adminAuth) {
          try {
            const authData = JSON.parse(adminAuth)
            authData.token = refreshData.session.access_token
            localStorage.setItem('adminAuth', JSON.stringify(authData))
            console.log('[Auth] Updated token in localStorage')
          } catch (e) {
            console.error('[Auth] Error updating localStorage:', e)
          }
        }
        
        return refreshData.session.access_token
      }
    }
    
    return session.access_token
  } catch (error) {
    console.error('[Auth] Unexpected error getting fresh token:', error)
    return null
  }
}
