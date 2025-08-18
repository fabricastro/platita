import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === 'development', // Solo debug en desarrollo
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Iniciando proceso de autenticación...')
          console.log('🌍 Entorno:', process.env.NODE_ENV)
          console.log('🔗 DATABASE_URL configurada:', !!process.env.DATABASE_URL)
          console.log('🔑 NEXTAUTH_SECRET configurado:', !!process.env.NEXTAUTH_SECRET)
          console.log('🌐 NEXTAUTH_URL configurado:', process.env.NEXTAUTH_URL)
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Credenciales faltantes')
            throw new Error('Email y contraseña son requeridos')
          }

          console.log('👤 Buscando usuario con email:', credentials.email)

          // Verificar conexión a la base de datos
          try {
            await prisma.$connect()
            console.log('✅ Conexión a BD exitosa')
          } catch (dbError) {
            console.error('❌ Error de conexión a BD:', dbError)
            throw new Error('Error de conexión a la base de datos')
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log('❌ Usuario no encontrado en la base de datos')
            throw new Error('Usuario no encontrado')
          }

          if (!user.password) {
            console.log('❌ Usuario sin contraseña')
            throw new Error('Usuario sin contraseña configurada')
          }

          console.log('🔑 Verificando contraseña...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('❌ Contraseña inválida')
            throw new Error('Contraseña incorrecta')
          }

          console.log('✅ Usuario autenticado exitosamente:', { 
            id: user.id, 
            email: user.email,
            name: user.name 
          })
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('💥 Error en authorize:', error)
          console.error('📋 Stack trace:', error instanceof Error ? error.stack : 'No stack available')
          
          // En producción, no exponer detalles del error
          if (process.env.NODE_ENV === 'production') {
            throw new Error('Error de autenticación')
          }
          
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días por defecto
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días por defecto
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login', // Página de error personalizada
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        // Agregar timestamp de creación del token
        token.createdAt = Date.now()
      }
      
      // Si es un update de sesión, actualizar el token
      if (trigger === 'update' && session) {
        Object.assign(token, session)
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        // Agregar información adicional a la sesión
        session.user.createdAt = token.createdAt as number
      }
      return session
    },
  },
}
