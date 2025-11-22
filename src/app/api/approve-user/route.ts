import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })
  }

  const userId = session.user.id
  const role = session.user.role

  if (role !== 'master') {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 })
  }

  const body = await req.json()
  const { id, ownerId } = body

  if (!id) {
    return NextResponse.json({ message: 'ID inválido.' }, { status: 400 })
  }

  // Se não passar ownerId, usar o master que está aprovando
  const finalOwnerId = ownerId || userId

  // Validar se o ownerId é realmente um master
  if (ownerId) {
    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { role: true },
    })

    if (!owner || owner.role !== 'master') {
      return NextResponse.json(
        { message: 'OwnerId deve ser um usuário master.' },
        { status: 400 },
      )
    }
  }

  try {
    await prisma.user.update({
      where: { id },
      data: {
        status: 'aprovado',
        ownerId: finalOwnerId,
      },
    })

    return NextResponse.json({ message: 'Usuário aprovado.' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
