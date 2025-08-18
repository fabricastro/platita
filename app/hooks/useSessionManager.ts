'use client'

import { useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export const useSessionManager = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Función para renovar la sesión
  const refreshSession = useCallback(async () => {
    try {
      // Intentar renovar la sesión
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to refresh session')
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
      // Si falla la renovación, cerrar sesión
      await signOut({ redirect: false })
      router.push('/auth/login')
    }
  }, [router])

  // Verificar si la sesión está por expirar
  const checkSessionExpiry = useCallback(() => {
    if (!session?.user?.createdAt) return

    const now = Date.now()
    const sessionAge = now - session.user.createdAt
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 días en milisegundos
    
    // Si la sesión tiene más de 25 días, intentar renovarla
    if (sessionAge > (25 * 24 * 60 * 60 * 1000)) {
      refreshSession()
    }
  }, [session, refreshSession])

  // Efecto para verificar la sesión periódicamente
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Verificar cada hora
      const interval = setInterval(checkSessionExpiry, 60 * 60 * 1000)
      
      // Verificar también cuando la ventana vuelve a estar activa
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          checkSessionExpiry()
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [status, session, checkSessionExpiry])

  // Función para cerrar sesión manualmente
  const handleSignOut = useCallback(async () => {
    await signOut({ 
      callbackUrl: '/auth/login',
      redirect: true 
    })
  }, [])

  return {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    refreshSession,
    signOut: handleSignOut,
  }
}
