import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'master') {
    return NextResponse.json(
      { message: 'Apenas o master pode excluir usuários.' },
      { status: 403 },
    )
  }

  const userId = params.id

  try {
    const documentos = await prisma.document.findFirst({
      where: { userId },
    })

    if (documentos) {
      return NextResponse.json(
        {
          message:
            'Não é possível excluir este usuário pois ele possui documentos vinculados. Exclua os documentos antes de excluir o usuário.',
        },
        { status: 400 },
      )
    }

    const deletedUser = await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json(deletedUser)
  } catch (err) {
    console.error('[DELETE USER]', err)
    return NextResponse.json(
      { message: 'Erro interno ao excluir usuário.' },
      { status: 500 },
    )
  }
}
