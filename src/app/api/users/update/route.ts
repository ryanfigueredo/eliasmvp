import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, name, status, role } = body

    if (!id) {
      return NextResponse.json(
        { message: 'ID do usuário não foi informado.' },
        { status: 400 },
      )
    }

    const updates: Record<string, any> = {}
    if (name) updates.name = name
    if (status) updates.status = status

    if (role) {
      if (session.user.role !== 'master') {
        return NextResponse.json(
          { message: 'Apenas o master pode alterar o cargo.' },
          { status: 403 },
        )
      }
      updates.role = role
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PUT /api/users/update]', err)
    return NextResponse.json(
      { message: 'Erro ao atualizar usuário.' },
      { status: 500 },
    )
  }
}
