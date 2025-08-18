import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Probando conexión a la base de datos...')
    console.log('🌍 Entorno:', process.env.NODE_ENV)
    console.log('🔗 DATABASE_URL configurada:', !!process.env.DATABASE_URL)
    
    // Solo ejecutar en runtime, no durante el build
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      // Probar conexión básica
      await prisma.$connect()
      console.log('✅ Conexión a la base de datos exitosa')
      
      // Contar usuarios
      const userCount = await prisma.user.count()
      console.log('👥 Número de usuarios en la base de datos:', userCount)
      
      // Listar algunos usuarios (sin contraseñas)
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        },
        take: 5
      })
      
      return NextResponse.json({
        success: true,
        message: 'Conexión a la base de datos exitosa',
        environment: process.env.NODE_ENV,
        databaseConfigured: !!process.env.DATABASE_URL,
        userCount,
        sampleUsers: users
      })
    }
    
    // Respuesta por defecto durante el build
    return NextResponse.json({
      success: true,
      message: 'Endpoint disponible en runtime',
      environment: process.env.NODE_ENV,
      databaseConfigured: !!process.env.DATABASE_URL
    })
    
  } catch (error) {
    console.error('❌ Error en la conexión a la base de datos:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error en la conexión a la base de datos',
      error: error instanceof Error ? error.message : 'Error desconocido',
      environment: process.env.NODE_ENV,
      databaseConfigured: !!process.env.DATABASE_URL
    }, { status: 500 })
  } finally {
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      await prisma.$disconnect()
    }
  }
}
