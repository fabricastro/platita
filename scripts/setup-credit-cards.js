#!/usr/bin/env node

/**
 * Script de configuración para funcionalidades de tarjetas de crédito
 * Este script ayuda a configurar la base de datos y verificar la implementación
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏦 Configurando funcionalidades de tarjetas de crédito...\n');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync('prisma/schema.prisma')) {
  console.error('❌ Error: No se encontró el esquema de Prisma');
  console.error('   Asegúrate de ejecutar este script desde la raíz del proyecto');
  process.exit(1);
}

// Verificar que Prisma está instalado
try {
  execSync('npx prisma --version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Error: Prisma no está instalado');
  console.error('   Ejecuta: npm install prisma @prisma/client');
  process.exit(1);
}

// Verificar que la base de datos está configurada
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está configurada');
  console.error('   Verifica tu archivo .env');
  process.exit(1);
}

console.log('✅ Verificaciones básicas completadas\n');

// Función para ejecutar comandos de manera segura
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completado\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error en: ${description}`);
    console.error(`   Comando: ${command}`);
    console.error(`   Error: ${error.message}\n`);
    return false;
  }
}

// Función para verificar archivos
function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}: ${filePath}`);
    return true;
  } else {
    console.log(`❌ ${description} no encontrado: ${filePath}`);
    return false;
  }
}

console.log('📁 Verificando archivos implementados...\n');

// Verificar componentes
const components = [
  'app/components/CreditCardSelector.tsx',
  'app/components/CardClosingsManager.tsx',
  'app/components/InstallmentsTracker.tsx',
  'app/components/CreditCardsManager.tsx',
  'app/components/CreditCardsDashboard.tsx'
];

components.forEach(component => {
  checkFile(component, 'Componente');
});

console.log('');

// Verificar APIs
const apis = [
  'app/api/credit-cards/route.ts',
  'app/api/card-closings/route.ts'
];

apis.forEach(api => {
  checkFile(api, 'API');
});

console.log('');

// Verificar tipos
checkFile('app/types/index.ts', 'Tipos actualizados');
checkFile('app/constants/index.ts', 'Constantes de tarjetas');

console.log('\n📋 Resumen de implementación:\n');

// Verificar esquema de Prisma
if (fs.existsSync('prisma/schema.prisma')) {
  const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
  const hasCreditCard = schemaContent.includes('model CreditCard');
  const hasCardClosing = schemaContent.includes('model CardClosing');
  
  console.log(`📊 Esquema de Prisma:`);
  console.log(`   - Modelo CreditCard: ${hasCreditCard ? '✅' : '❌'}`);
  console.log(`   - Modelo CardClosing: ${hasCardClosing ? '✅' : '❌'}`);
}

console.log('');

// Verificar que todos los archivos necesarios existen
const allFiles = [...components, ...apis, 'app/types/index.ts', 'app/constants/index.ts'];
const missingFiles = allFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length === 0) {
  console.log('🎉 ¡Todos los archivos están implementados correctamente!');
  
  console.log('\n🚀 Próximos pasos:');
  console.log('1. Ejecutar migración de base de datos:');
  console.log('   npx prisma migrate dev --name add-credit-cards-and-closings');
  console.log('');
  console.log('2. Generar cliente de Prisma:');
  console.log('   npx prisma generate');
  console.log('');
  console.log('3. Reiniciar el servidor de desarrollo:');
  console.log('   npm run dev');
  console.log('');
  console.log('4. Probar las nuevas funcionalidades en la aplicación');
  
} else {
  console.log('⚠️  Archivos faltantes:');
  missingFiles.forEach(file => {
    console.log(`   - ${file}`);
  });
  
  console.log('\n🔧 Para completar la implementación:');
  console.log('1. Asegúrate de que todos los archivos estén creados');
  console.log('2. Verifica que las importaciones sean correctas');
  console.log('3. Ejecuta este script nuevamente');
}

console.log('\n📚 Documentación disponible en: CREDIT_CARDS_FEATURES.md');
console.log('');

// Verificar dependencias del package.json
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  console.log('📦 Dependencias verificadas:');
  console.log(`   - Prisma: ${dependencies.prisma ? '✅' : '❌'}`);
  console.log(`   - @prisma/client: ${dependencies['@prisma/client'] ? '✅' : '❌'}`);
  console.log(`   - next-auth: ${dependencies['next-auth'] ? '✅' : '❌'}`);
  console.log(`   - lucide-react: ${dependencies['lucide-react'] ? '✅' : '❌'}`);
  console.log(`   - sonner: ${dependencies.sonner ? '✅' : '❌'}`);
}

console.log('\n🏁 Script de configuración completado');
console.log('   Revisa los resultados arriba y sigue los próximos pasos sugeridos');
