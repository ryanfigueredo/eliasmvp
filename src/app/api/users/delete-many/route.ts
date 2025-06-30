import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'master') {
    return NextResponse.json(
      { message: 'Apenas o master pode excluir usuários.' },
      { status: 403 },
    )
  }

  let userIds: string[] = []

  try {
    const body = await req.json()
    userIds = body.userIds

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { message: 'Lista de usuários inválida.' },
        { status: 400 },
      )
    }

    // Verifica quais usuários possuem documentos vinculados
    const usersWithDocs = await prisma.document.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true },
    })

    const nonDeletables = new Set(usersWithDocs.map((d) => d.userId))
    const deletableIds = userIds.filter((id) => !nonDeletables.has(id))

    // Exclui apenas os que podem ser excluídos
    if (deletableIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: deletableIds } },
      })
    }

    return NextResponse.json({
      deleted: deletableIds.length,
      blocked: Array.from(nonDeletables),
      message:
        nonDeletables.size > 0
          ? 'Alguns usuários não foram excluídos pois possuem documentos vinculados.'
          : 'Todos os usuários foram excluídos com sucesso.',
    })
  } catch (error) {
    console.error('[DELETE MANY USERS]', error)
    return NextResponse.json(
      { message: 'Erro ao excluir usuários.' },
      { status: 500 },
    )
  }
}
