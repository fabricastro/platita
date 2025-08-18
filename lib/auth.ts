import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  debug: true, // Habilitar debug en producción también
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
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Credenciales faltantes')
            return null
          }

          console.log('👤 Buscando usuario con email:', credentials.email)

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log('❌ Usuario no encontrado en la base de datos')
            return null
          }

          if (!user.password) {
            console.log('❌ Usuario sin contraseña')
            return null
          }

          console.log('🔑 Verificando contraseña...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('❌ Contraseña inválida')
            return null
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
          return null
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
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 días
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  pages: {
    signIn: '/auth/login',
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
