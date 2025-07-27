import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const adminId = searchParams.get('adminId')

  if (!adminId) {
    return NextResponse.json(
      { message: 'adminId é obrigatório.' },
      { status: 400 },
    )
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'consultor',
        status: 'aprovado',
        adminId: adminId,
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar consultores:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    )
  }
}
