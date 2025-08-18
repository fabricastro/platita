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

    const savings = await prisma.saving.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(savings)
  } catch (error) {
    console.error('Error fetching savings:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { description, amount, date } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const saving = await prisma.saving.create({
      data: {
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        userId: user.id
      }
    })

    return NextResponse.json(saving)
  } catch (error) {
    console.error('Error creating saving:', error)
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
    if (updateData.date !== undefined) processedData.date = new Date(updateData.date)

    const saving = await prisma.saving.update({
      where: { 
        id,
        userId: user.id // Asegurar que el ahorro pertenece al usuario
      },
      data: processedData
    })

    return NextResponse.json(saving)
  } catch (error) {
    console.error('Error updating saving:', error)
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

    await prisma.saving.delete({
      where: { 
        id,
        userId: user.id // Asegurar que el ahorro pertenece al usuario
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting saving:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
