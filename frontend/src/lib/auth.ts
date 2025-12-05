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
