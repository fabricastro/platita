'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Verificar si hay un error en la URL (desde NextAuth)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      console.log('🔍 Error detectado en URL:', errorParam)
      let errorMessage = 'Error de autenticación'
      
      switch (errorParam) {
        case 'CredentialsSignin':
          errorMessage = 'Email o contraseña incorrectos. Verifica tus credenciales.'
          break
        case 'Configuration':
          errorMessage = 'Error de configuración del servidor. Contacta al administrador.'
          break
        case 'AccessDenied':
          errorMessage = 'Acceso denegado. Tu cuenta puede estar deshabilitada.'
          break
        case 'Verification':
          errorMessage = 'Error de verificación. Intenta de nuevo.'
          break
        default:
          errorMessage = `Error de autenticación: ${errorParam}`
      }
      
      setError(errorMessage)
    }
  }, [searchParams])

  // Verificar si ya hay una sesión activa
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        console.log('✅ Sesión activa detectada, redirigiendo...')
        router.push('/')
      }
    }
    
    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('🚀 Intentando iniciar sesión...')
      console.log('🌍 Entorno:', process.env.NODE_ENV)
      console.log('📧 Email:', email)
      console.log('🔗 URL actual:', window.location.href)
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        // Configurar la duración de la sesión según la preferencia del usuario
        maxAge: rememberMe ? 90 * 24 * 60 * 60 : 30 * 24 * 60 * 60, // 90 días o 30 días
      })

      console.log('📋 Resultado del signIn:', result)
      console.log('🔍 Detalles del resultado:', {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url
      })

      if (result?.error) {
        console.error('❌ Error en autenticación:', result.error)
        
        // Manejar errores específicos
        let errorMessage = 'Error de autenticación'
        switch (result.error) {
          case 'CredentialsSignin':
            errorMessage = 'Email o contraseña incorrectos. Verifica tus credenciales.'
            break
          case 'Configuration':
            errorMessage = 'Error de configuración del servidor. Contacta al administrador.'
            break
          case 'AccessDenied':
            errorMessage = 'Acceso denegado. Tu cuenta puede estar deshabilitada.'
            break
          case 'Verification':
            errorMessage = 'Error de verificación. Intenta de nuevo.'
            break
          default:
            errorMessage = `Error de autenticación: ${result.error}`
        }
        
        setError(errorMessage)
      } else if (result?.ok) {
        console.log('✅ Login exitoso, redirigiendo...')
        setIsSuccess(true)
        
        // Forzar la actualización de la sesión
        try {
          // Opción 1: Esperar un poco y luego redirigir
          setTimeout(() => {
            console.log('🔄 Redirigiendo después del timeout...')
            window.location.href = '/'
          }, 1500) // Aumentar el tiempo para que el usuario vea el mensaje
        } catch (error) {
          console.log('🔄 Fallback a router.push...')
          // Opción 2: Router de Next.js
          router.push('/')
        }
      } else {
        console.error('❓ Resultado inesperado:', result)
        setError('Error inesperado al iniciar sesión. Intenta de nuevo.')
      }
    } catch (error) {
      console.error('💥 Error en el login:', error)
      setError('Error de conexión al servidor. Verifica tu conexión a internet.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      {/* Logo y Slogan */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center space-y-4">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt="Platita Logo"
            width={80}
            height={80}
            priority
            className="w-20 h-20"
            onError={(e) => {
              console.error('Error loading logo:', e);
              // Fallback a texto si la imagen falla
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
        <h1 className="text-2xl font-bold text-primary">Platita</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Gestiona tu platita de manera inteligente
        </p>
      </div>

      <Card className="w-full max-w-md mt-32">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Accede a tu cuenta de platita
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Dirección de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label 
                htmlFor="rememberMe" 
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Recordar sesión por 90 días
              </Label>
            </div>

            {error && (
              <div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded-md">
                {error}
              </div>
            )}

            {isSuccess && (
              <div className="text-green-600 text-sm text-center bg-green-100 p-2 rounded-md">
                ✅ ¡Login exitoso! Redirigiendo...
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full"
            >
              {isLoading ? 'Iniciando sesión...' : isSuccess ? '¡Login exitoso!' : 'Iniciar Sesión'}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/register"
                className="text-primary hover:text-primary/80 text-sm underline-offset-4 hover:underline"
              >
                ¿No tienes cuenta? Regístrate aquí
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
