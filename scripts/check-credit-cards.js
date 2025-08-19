const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCreditCards() {
  try {
    console.log('🔍 Verificando tarjetas de crédito en la base de datos...\n')
    
    // Obtener todas las tarjetas
    const creditCards = await prisma.creditCard.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        _count: {
          select: {
            expenses: true
          }
        }
      }
    })

    if (creditCards.length === 0) {
      console.log('❌ No se encontraron tarjetas de crédito en la base de datos.')
      console.log('💡 Asegúrate de crear al menos una tarjeta antes de crear gastos de tarjeta.')
    } else {
      console.log(`✅ Se encontraron ${creditCards.length} tarjeta(s) de crédito:\n`)
      
      creditCards.forEach((card, index) => {
        console.log(`${index + 1}. ${card.name}`)
        console.log(`   ID: ${card.id}`)
        console.log(`   Banco: ${card.bank}`)
        console.log(`   Usuario: ${card.user.email}`)
        console.log(`   Gastos asociados: ${card._count.expenses}`)
        console.log(`   Día de cierre: ${card.closingDay}`)
        console.log(`   Día de vencimiento: ${card.dueDay}`)
        console.log('   ---')
      })
    }

    // Verificar gastos huérfanos (sin tarjeta válida)
    const orphanExpenses = await prisma.expense.findMany({
      where: {
        cardId: {
          not: null
        },
        card: null
      }
    })

    if (orphanExpenses.length > 0) {
      console.log(`\n⚠️  Se encontraron ${orphanExpenses.length} gasto(s) con cardId inválido:`)
      orphanExpenses.forEach((expense, index) => {
        console.log(`${index + 1}. ${expense.description} - cardId: ${expense.cardId}`)
      })
    }

    console.log('\n✅ Verificación completada.')
    
  } catch (error) {
    console.error('❌ Error al verificar las tarjetas de crédito:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCreditCards()
