import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['admin', 'consultor'] },
        status: 'aprovado',
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    )
  }
}
