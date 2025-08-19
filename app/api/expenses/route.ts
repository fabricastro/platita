import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Función helper para calcular la fecha de pago basada en el ciclo de cierre de la tarjeta
function calculatePaymentDate(purchaseDate: Date, card: { closingDay: number, dueDay: number }, installmentNumber: number = 1): Date {
  const purchase = new Date(purchaseDate)
  const purchaseMonth = purchase.getMonth()
  const purchaseYear = purchase.getFullYear()
  const purchaseDay = purchase.getDate()
  
  // Determinar en qué mes de cierre cae la compra
  let closingMonth = purchaseMonth
  let closingYear = purchaseYear
  
  // Si la compra es después del día de cierre del mes actual, 
  // la compra va al cierre del mes siguiente
  if (purchaseDay > card.closingDay) {
    closingMonth += 1
    if (closingMonth > 11) {
      closingMonth = 0
      closingYear += 1
    }
  }
  
  // Agregar los meses adicionales por la cuota (installmentNumber - 1)
  closingMonth += (installmentNumber - 1)
  while (closingMonth > 11) {
    closingMonth -= 12
    closingYear += 1
  }
  
  // La fecha de pago es el día de vencimiento del mes siguiente al cierre
  let paymentMonth = closingMonth + 1
  let paymentYear = closingYear
  
  if (paymentMonth > 11) {
    paymentMonth = 0
    paymentYear += 1
  }
  
  // Crear la fecha de pago
  const paymentDate = new Date(paymentYear, paymentMonth, card.dueDay)
  
  return paymentDate
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      include: {
        card: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { description, amount, category, date, type, installments, totalAmount, purchaseMonth, cardId } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (type === 'tarjeta' && installments && totalAmount) {
      // Validar que la tarjeta existe y pertenece al usuario si se proporciona cardId
      if (!cardId) {
        return NextResponse.json({ error: 'ID de tarjeta es requerido para gastos de tarjeta' }, { status: 400 })
      }

      const card = await prisma.creditCard.findFirst({
        where: { 
          id: cardId,
          userId: user.id 
        }
      })

      if (!card) {
        return NextResponse.json({ error: 'Tarjeta de crédito no encontrada o no pertenece al usuario' }, { status: 404 })
      }

      // Para gastos de tarjeta, crear múltiples registros (uno por cuota)
      const installmentAmount = parseFloat(totalAmount) / parseInt(installments)
      const purchaseDate = new Date(date)
      const createdExpenses = []

      for (let i = 1; i <= parseInt(installments); i++) {
        // Calcular la fecha de pago basada en el ciclo de cierre de la tarjeta
        const paymentDate = calculatePaymentDate(purchaseDate, card, i)

        const expense = await prisma.expense.create({
          data: {
            description: `${description} (${i}/${installments})`,
            amount: installmentAmount,
            category,
            date: paymentDate, // Usar la fecha de pago calculada
            type: 'tarjeta',
            installments: parseInt(installments),
            currentInstallment: i,
            totalAmount: parseFloat(totalAmount),
            purchaseMonth: purchaseDate, // Guardar la fecha de compra original
            cardId: cardId,
            userId: user.id
          }
        })
        createdExpenses.push(expense)
      }

      return NextResponse.json(createdExpenses)
    } else {
      // Validar que la tarjeta existe y pertenece al usuario si se proporciona cardId para gastos únicos
      let paymentDate = new Date(date)
      
      if (cardId) {
        const card = await prisma.creditCard.findFirst({
          where: { 
            id: cardId,
            userId: user.id 
          }
        })

        if (!card) {
          return NextResponse.json({ error: 'Tarjeta de crédito no encontrada o no pertenece al usuario' }, { status: 404 })
        }

        // Si es un gasto de tarjeta único, calcular la fecha de pago
        if (type === 'tarjeta') {
          paymentDate = calculatePaymentDate(new Date(date), card, 1)
        }
      }

      // Para gastos únicos
      const expense = await prisma.expense.create({
        data: {
          description,
          amount: parseFloat(amount),
          category,
          date: paymentDate,
          type: type || 'unico',
          cardId: cardId || null,
          purchaseMonth: (cardId && type === 'tarjeta') ? new Date(date) : null,
          userId: user.id
        }
      })

      return NextResponse.json(expense)
    }
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const updateData = await request.json()
    
    // Obtener el gasto original para verificar si es de tarjeta
    const originalExpense = await prisma.expense.findFirst({
      where: { 
        id,
        userId: user.id 
      }
    })

    if (!originalExpense) {
      return NextResponse.json({ error: 'Gasto no encontrado' }, { status: 404 })
    }

    // Si es un gasto de tarjeta y se está actualizando el monto (que viene como totalAmount)
    if (originalExpense.type === 'tarjeta' && updateData.amount !== undefined) {
      const newTotalAmount = parseFloat(updateData.amount)
      const installments = originalExpense.installments || 1
      const newInstallmentAmount = newTotalAmount / installments

      // Buscar todas las cuotas relacionadas (mismo totalAmount, installments, y descripción base)
      const baseDescription = originalExpense.description.replace(/\s*\(\d+\/\d+\)$/, '')
      
      const relatedExpenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
          type: 'tarjeta',
          totalAmount: originalExpense.totalAmount,
          installments: originalExpense.installments,
          description: {
            startsWith: baseDescription
          }
        }
      })

      // Obtener la información de la tarjeta una sola vez si se va a actualizar la fecha
      let cardInfo = null
      if (updateData.date !== undefined && relatedExpenses.length > 0 && relatedExpenses[0].cardId) {
        cardInfo = await prisma.creditCard.findFirst({
          where: { id: relatedExpenses[0].cardId }
        })
      }

      // Actualizar todas las cuotas relacionadas
      const updatePromises = relatedExpenses.map(expense => {
        const processedData: any = {
          totalAmount: newTotalAmount,
          amount: newInstallmentAmount
        }
        
        // Actualizar otros campos si se proporcionan
        if (updateData.description !== undefined) {
          // Limpiar la descripción removiendo cualquier paréntesis de cuotas existente
          const cleanDescription = updateData.description.replace(/\s*\(\d+\/\d+\)$/, '')
          processedData.description = `${cleanDescription} (${expense.currentInstallment}/${installments})`
        }
        if (updateData.category !== undefined) processedData.category = updateData.category
        if (updateData.date !== undefined) {
          // Para gastos de tarjeta, recalcular la fecha de pago basada en el nuevo ciclo de cierre
          const purchaseDate = new Date(updateData.date)
          
          if (cardInfo) {
            const paymentDate = calculatePaymentDate(purchaseDate, cardInfo, expense.currentInstallment || 1)
            processedData.date = paymentDate
            processedData.purchaseMonth = purchaseDate
          } else {
            // Fallback al método anterior si no se encuentra la tarjeta
            const baseDate = new Date(updateData.date)
            const installmentDate = new Date(baseDate)
            installmentDate.setMonth(installmentDate.getMonth() + ((expense.currentInstallment || 1) - 1))
            processedData.date = installmentDate
          }
        }

        return prisma.expense.update({
          where: { id: expense.id },
          data: processedData
        })
      })

      await Promise.all(updatePromises)
      
      // Retornar el gasto original actualizado
      const updatedExpense = await prisma.expense.findFirst({
        where: { id },
        include: {
          card: true
        }
      })

      return NextResponse.json(updatedExpense)
    } else {
      // Para gastos únicos o actualizaciones que no involucran el monto total
      const processedData: any = {}
      if (updateData.description !== undefined) processedData.description = updateData.description
      if (updateData.amount !== undefined) processedData.amount = parseFloat(updateData.amount)
      if (updateData.category !== undefined) processedData.category = updateData.category
      if (updateData.date !== undefined) {
        // Si es un gasto de tarjeta único, recalcular la fecha de pago
        if (originalExpense.type === 'tarjeta' && originalExpense.cardId) {
          const cardInfo = await prisma.creditCard.findFirst({
            where: { id: originalExpense.cardId }
          })
          
          if (cardInfo) {
            const purchaseDate = new Date(updateData.date)
            const paymentDate = calculatePaymentDate(purchaseDate, cardInfo, 1)
            processedData.date = paymentDate
            processedData.purchaseMonth = purchaseDate
          } else {
            processedData.date = new Date(updateData.date)
          }
        } else {
          processedData.date = new Date(updateData.date)
        }
      }
      if (updateData.type !== undefined) processedData.type = updateData.type
      if (updateData.installments !== undefined) processedData.installments = parseInt(updateData.installments)
      if (updateData.currentInstallment !== undefined) processedData.currentInstallment = parseInt(updateData.currentInstallment)
      if (updateData.totalAmount !== undefined) processedData.totalAmount = parseFloat(updateData.totalAmount)

      const expense = await prisma.expense.update({
        where: { 
          id,
          userId: user.id 
        },
        data: processedData,
        include: {
          card: true
        }
      })

      return NextResponse.json(expense)
    }
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    await prisma.expense.delete({
      where: { 
        id,
        userId: user.id // Asegurar que el gasto pertenece al usuario
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
