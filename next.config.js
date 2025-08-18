/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para imágenes estáticas
  images: {
    unoptimized: true,
    domains: [],
  },
  // Configuración para assets estáticos
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Configuración para exportación estática si es necesario
  trailingSlash: false,
  // Configuración para manejo de archivos estáticos
  experimental: {
    // Remover optimizeCss que causa problemas
  },
  // Configuración para evitar problemas de exportación estática
  output: 'standalone',
  // Configuración para manejar páginas de error
  async redirects() {
    return []
  },
  async headers() {
    return []
  }
}

module.exports = nextConfig
