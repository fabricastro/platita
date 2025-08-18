#!/usr/bin/env node

/**
 * Script para verificar la configuración de autenticación
 * Ejecutar: node scripts/check-auth-config.js
 */

console.log('🔍 Verificando configuración de autenticación...\n')

// Verificar variables de entorno críticas
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'DATABASE_URL',
  'NODE_ENV'
]

console.log('📋 Variables de entorno requeridas:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  const isSet = !!value
  const status = isSet ? '✅' : '❌'
  const displayValue = isSet ? (varName.includes('SECRET') ? '***configurado***' : value) : 'NO CONFIGURADO'
  
  console.log(`${status} ${varName}: ${displayValue}`)
})

console.log('\n🔧 Configuración adicional:')
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'NO CONFIGURADO'}`)
console.log(`🔗 DATABASE_URL configurado: ${!!process.env.DATABASE_URL}`)
console.log(`🔑 NEXTAUTH_SECRET configurado: ${!!process.env.NEXTAUTH_SECRET}`)
console.log(`🌐 NEXTAUTH_URL configurado: ${!!process.env.NEXTAUTH_URL}`)

// Verificar formato de NEXTAUTH_URL
if (process.env.NEXTAUTH_URL) {
  try {
    const url = new URL(process.env.NEXTAUTH_URL)
    console.log(`✅ NEXTAUTH_URL es una URL válida: ${url.protocol}//${url.host}`)
  } catch (error) {
    console.log(`❌ NEXTAUTH_URL no es una URL válida: ${process.env.NEXTAUTH_URL}`)
  }
}

// Verificar longitud del NEXTAUTH_SECRET
if (process.env.NEXTAUTH_SECRET) {
  const secretLength = process.env.NEXTAUTH_SECRET.length
  if (secretLength >= 32) {
    console.log(`✅ NEXTAUTH_SECRET tiene longitud adecuada (${secretLength} caracteres)`)
  } else {
    console.log(`⚠️  NEXTAUTH_SECRET es muy corto (${secretLength} caracteres). Recomendado: mínimo 32 caracteres`)
  }
}

console.log('\n📝 Instrucciones para Vercel:')
console.log('1. Ve a tu dashboard de Vercel')
console.log('2. Selecciona tu proyecto')
console.log('3. Ve a Settings > Environment Variables')
console.log('4. Configura las siguientes variables:')
console.log('   - NEXTAUTH_URL: https://tu-dominio.vercel.app')
console.log('   - NEXTAUTH_SECRET: (genera uno con: openssl rand -base64 32)')
console.log('   - DATABASE_URL: tu-url-de-postgresql')
console.log('   - DIRECT_URL: tu-url-de-postgresql (igual que DATABASE_URL)')
console.log('5. Redeploy tu aplicación')

console.log('\n🔧 Para generar un NEXTAUTH_SECRET seguro:')
console.log('openssl rand -base64 32')
