// src/app/api/admin/consultores/route.ts
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const consultores = await prisma.user.findMany({
      where: {
        adminId: session.user.id,
        role: 'consultor',
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    })

    return NextResponse.json(consultores, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar consultores:', error)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
