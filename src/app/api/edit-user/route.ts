import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Não autorizado.' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const { id, name, cpf, email, password, role, status, whatsapp, ownerId } = body

    if (!id || !name || !cpf || !email || !role || !status) {
      return NextResponse.json(
        { message: 'Dados obrigatórios incompletos.' },
        { status: 400 },
      )
    }

    // Apenas masters podem definir ownerId
    if (ownerId && session.user.role !== 'master') {
      return NextResponse.json(
        { message: 'Apenas masters podem vincular usuários.' },
        { status: 403 },
      )
    }

    // Se estiver definindo ownerId, validar se é um master
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

    const data: any = { name, cpf, email, role, status, whatsapp: whatsapp || null }

    // Se mudou para aprovado e tem ownerId, definir ownerId
    if (status === 'aprovado' && ownerId) {
      data.ownerId = ownerId
    }

    // Se mudou para aprovado e não tem ownerId mas o usuário editando é master, usar o master
    if (status === 'aprovado' && !ownerId && session.user.role === 'master') {
      data.ownerId = session.user.id
    }

    if (password && password.length >= 6) {
      data.password = await bcrypt.hash(password, 10)
    }

    await prisma.user.update({
      where: { id },
      data,
    })

    return NextResponse.json(
      { message: 'Usuário atualizado.' },
      { status: 200 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Erro ao atualizar usuário.' },
      { status: 500 },
    )
  }
}
