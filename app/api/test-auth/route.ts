import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔐 Probando autenticación...')
    
    // Respuesta simple durante el build
    return NextResponse.json({
      success: true,
      authenticated: false,
      session: null,
      environment: process.env.NODE_ENV,
      message: 'Endpoint disponible en runtime',
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
