import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    console.log('🔐 Probando autenticación...')
    
    const session = await getServerSession(authOptions)
    
    console.log('📋 Sesión actual:', session ? {
      user: session.user,
      expires: session.expires
    } : 'No hay sesión')
    
    return NextResponse.json({
      success: true,
      authenticated: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name
        },
        expires: session.expires
      } : null,
      environment: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET
    })
    
  } catch (error) {
    console.error('❌ Error en la autenticación:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error en la autenticación',
      error: error instanceof Error ? error.message : 'Error desconocido',
      environment: process.env.NODE_ENV
    }, { status: 500 })
  }
}
