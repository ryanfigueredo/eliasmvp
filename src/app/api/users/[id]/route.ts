import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  if (session.user.role !== 'master') {
    return NextResponse.json(
      { message: 'Apenas o master pode excluir usuários.' },
      { status: 403 },
    )
  }

  try {
    const user = await prisma.user.delete({ where: { id: params.id } })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao excluir o usuário' },
      { status: 500 },
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
  }

  const { name, status, role } = await req.json()
  const updates: any = {}
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

  try {
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updates,
    })
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar usuário.' },
      { status: 500 },
    )
  }
}
