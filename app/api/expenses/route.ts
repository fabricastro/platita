import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { description, amount, category, date, type, installments, totalAmount } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (type === 'tarjeta' && installments && totalAmount) {
      // Para gastos de tarjeta, crear múltiples registros (uno por cuota)
      const installmentAmount = parseFloat(totalAmount) / parseInt(installments)
      const baseDate = new Date(date)
      const createdExpenses = []

      for (let i = 1; i <= parseInt(installments); i++) {
        const installmentDate = new Date(baseDate)
        installmentDate.setMonth(installmentDate.getMonth() + (i - 1))

        const expense = await prisma.expense.create({
          data: {
            description: `${description} (${i}/${installments})`,
            amount: installmentAmount,
            category,
            date: installmentDate,
            type: 'tarjeta',
            installments: parseInt(installments),
            currentInstallment: i,
            totalAmount: parseFloat(totalAmount),
            userId: user.id
          }
        })
        createdExpenses.push(expense)
      }

      return NextResponse.json(createdExpenses)
    } else {
      // Para gastos únicos
      const expense = await prisma.expense.create({
        data: {
          description,
          amount: parseFloat(amount),
          category,
          date: new Date(date),
          type: type || 'unico',
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
    
    // Procesar los datos de actualización
    const processedData: any = {}
    if (updateData.description !== undefined) processedData.description = updateData.description
    if (updateData.amount !== undefined) processedData.amount = parseFloat(updateData.amount)
    if (updateData.category !== undefined) processedData.category = updateData.category
    if (updateData.date !== undefined) processedData.date = new Date(updateData.date)
    if (updateData.type !== undefined) processedData.type = updateData.type
    if (updateData.installments !== undefined) processedData.installments = parseInt(updateData.installments)
    if (updateData.currentInstallment !== undefined) processedData.currentInstallment = parseInt(updateData.currentInstallment)
    if (updateData.totalAmount !== undefined) processedData.totalAmount = parseFloat(updateData.totalAmount)

    const expense = await prisma.expense.update({
      where: { 
        id,
        userId: user.id // Asegurar que el gasto pertenece al usuario
      },
      data: processedData
    })

    return NextResponse.json(expense)
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
