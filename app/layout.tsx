import type { Metadata } from 'next'
import { Readex_Pro } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'

const readexPro = Readex_Pro({
  subsets: ['latin'],
  variable: '--font-readex-pro',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'platita - administrador de gastos',
  description: 'Administra tus finanzas personales de manera simple y eficiente con Platita',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${readexPro.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          storageKey="platita-theme"
        >
          <Providers>
            {children}
            <Toaster 
              position="top-right"
              richColors
              closeButton
              duration={4000}
              className="z-50"
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
