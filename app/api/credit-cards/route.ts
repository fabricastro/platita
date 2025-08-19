import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener tarjetas del usuario
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

    const creditCards = await prisma.creditCard.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(creditCards)
  } catch (error) {
    console.error('Error fetching credit cards:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nueva tarjeta
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
    const { name, bank, logo, color, closingDay, dueDay, limit } = body

    // Validaciones
    if (!name || !bank || !logo || !color || !closingDay || !dueDay) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (closingDay < 1 || closingDay > 31 || dueDay < 1 || dueDay > 31) {
      return NextResponse.json({ error: 'Días de cierre y vencimiento deben estar entre 1 y 31' }, { status: 400 })
    }

    const creditCard = await prisma.creditCard.create({
      data: {
        name,
        bank,
        logo,
        color,
        closingDay: parseInt(closingDay),
        dueDay: parseInt(dueDay),
        limit: limit ? parseFloat(limit) : null,
        userId: user.id
      }
    })

    return NextResponse.json(creditCard, { status: 201 })
  } catch (error) {
    console.error('Error creating credit card:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT - Actualizar tarjeta
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
      return NextResponse.json({ error: 'ID de tarjeta requerido' }, { status: 400 })
    }

    const body = await request.json()
    const { name, bank, logo, color, closingDay, dueDay, limit } = body

    // Verificar que la tarjeta pertenece al usuario
    const existingCard = await prisma.creditCard.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingCard) {
      return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })
    }

    const updatedCard = await prisma.creditCard.update({
      where: { id },
      data: {
        name,
        bank,
        logo,
        color,
        closingDay: parseInt(closingDay),
        dueDay: parseInt(dueDay),
        limit: limit ? parseFloat(limit) : null
      }
    })

    return NextResponse.json(updatedCard)
  } catch (error) {
    console.error('Error updating credit card:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Eliminar tarjeta
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
      return NextResponse.json({ error: 'ID de tarjeta requerido' }, { status: 400 })
    }

    // Verificar que la tarjeta pertenece al usuario
    const existingCard = await prisma.creditCard.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingCard) {
      return NextResponse.json({ error: 'Tarjeta no encontrada' }, { status: 404 })
    }

    // Verificar que no hay gastos asociados
    const expensesWithCard = await prisma.expense.findFirst({
      where: { cardId: id }
    })

    if (expensesWithCard) {
      return NextResponse.json({ 
        error: 'No se puede eliminar la tarjeta porque tiene gastos asociados' 
      }, { status: 400 })
    }

    await prisma.creditCard.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Tarjeta eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting credit card:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
