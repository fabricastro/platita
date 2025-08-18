import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Manejo de errores de conexión
prisma.$connect()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida')
  })
  .catch((error) => {
    console.error('❌ Error conectando a la base de datos:', error)
  })

// Manejo de desconexión graceful
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
