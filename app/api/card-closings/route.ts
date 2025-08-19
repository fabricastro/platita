import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener cierres de tarjetas del usuario
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const cardId = searchParams.get('cardId')

    const whereClause: any = { userId: user.id }
    
    if (month) whereClause.month = parseInt(month)
    if (year) whereClause.year = parseInt(year)
    if (cardId) whereClause.cardId = cardId

    const cardClosings = await prisma.cardClosing.findMany({
      where: whereClause,
      include: {
        card: true
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    })

    return NextResponse.json(cardClosings)
  } catch (error) {
    console.error('Error fetching card closings:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nuevo cierre de tarjeta
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { month, year, totalAmount, dueAmount, cardId } = body

    // Validaciones
    if (!month || !year || !totalAmount || !dueAmount || !cardId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (month < 1 || month > 12) {
      return NextResponse.json({ error: 'Mes debe estar entre 1 y 12' }, { status: 400 })
    }

    // Verificar que la tarjeta pertenece al usuario
    const card = await prisma.creditCard.findFirst({
      where: { id: cardId, userId: user.id }
    })

    if (!card) {
      return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })
    }

    // Calcular fecha de vencimiento basada en el día de vencimiento de la tarjeta
    const dueDate = new Date(year, month - 1, card.dueDay)
    
    // Si la fecha de vencimiento ya pasó este año, usar el próximo año
    if (dueDate < new Date()) {
      dueDate.setFullYear(dueDate.getFullYear() + 1)
    }

    const cardClosing = await prisma.cardClosing.create({
      data: {
        month: parseInt(month),
        year: parseInt(year),
        totalAmount: parseFloat(totalAmount),
        dueAmount: parseFloat(dueAmount),
        dueDate,
        cardId,
        userId: user.id
      },
      include: {
        card: true
      }
    })

    return NextResponse.json(cardClosing, { status: 201 })
  } catch (error) {
    console.error('Error creating card closing:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar cierre de tarjeta
export async function PUT(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID de cierre requerido' }, { status: 400 })
    }

    const body = await request.json()
    const { status, paidAmount } = body

    // Verificar que el cierre pertenece al usuario
    const existingClosing = await prisma.cardClosing.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingClosing) {
      return NextResponse.json({ error: 'Cierre no encontrado' }, { status: 404 })
    }

    const updatedClosing = await prisma.cardClosing.update({
      where: { id },
      data: {
        status: status || existingClosing.status,
        paidAmount: paidAmount !== undefined ? parseFloat(paidAmount) : existingClosing.paidAmount
      },
      include: {
        card: true
      }
    })

    return NextResponse.json(updatedClosing)
  } catch (error) {
    console.error('Error updating card closing:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar cierre de tarjeta
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID de cierre requerido' }, { status: 400 })
    }

    // Verificar que el cierre pertenece al usuario
    const existingClosing = await prisma.cardClosing.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingClosing) {
      return NextResponse.json({ error: 'Cierre no encontrado' }, { status: 404 })
    }

    await prisma.cardClosing.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Cierre eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting card closing:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
