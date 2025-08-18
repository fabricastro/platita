#!/usr/bin/env node

console.log('🔍 Verificando configuración de Platita...\n')

// Verificar variables de entorno
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'DATABASE_URL'
]

console.log('📋 Variables de entorno requeridas:')
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'NEXTAUTH_SECRET' ? '***' : value}`)
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`)
  }
})

console.log('\n📁 Archivos de configuración:')
const fs = require('fs')
const path = require('path')

const configFiles = [
  'next.config.js',
  'lib/auth.ts',
  'lib/prisma.ts',
  'prisma/schema.prisma'
]

configFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Existe`)
  } else {
    console.log(`❌ ${file}: NO EXISTE`)
  }
})

console.log('\n🚀 Para continuar:')
console.log('1. Copia env.example a .env.local')
console.log('2. Configura las variables de entorno')
console.log('3. Ejecuta: npm run dev')
console.log('4. Verifica la consola del navegador para logs de autenticación')
