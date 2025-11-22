import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      console.error('[APPROVE-USER] Sem sessão:', { session })
      return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })
    }

    const userId = session.user.id
    const role = session.user.role

    console.log('[APPROVE-USER] Sessão:', { userId, role })

    if (role !== 'master') {
      console.error('[APPROVE-USER] Role não é master:', { role })
      return NextResponse.json({ message: 'Acesso negado. Apenas masters podem aprovar usuários.' }, { status: 403 })
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

    await prisma.user.update({
      where: { id },
      data: {
        status: 'aprovado',
        ownerId: finalOwnerId,
      },
    })

    return NextResponse.json({ message: 'Usuário aprovado.' }, { status: 200 })
  } catch (error) {
    console.error('[APPROVE-USER] Erro:', error)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
