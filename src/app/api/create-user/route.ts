import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ message: 'Não autenticado.' }, { status: 401 })
    }

    const body = await req.json()
    const { name, cpf, email, password, role, status, whatsapp, adminId, ownerId } = body

    if (!email || !password || !cpf) {
      return NextResponse.json(
        { message: 'Campos obrigatórios.' },
        { status: 400 },
      )
    }

    // ❌ Bloqueia criação de master por usuários não autorizados
    const isCreatingMaster = role === 'master'
    const isAuthorized =
      session.user.email === 'master@elias.com' ||
      session.user.email === 'master2@elias.com'

    if (isCreatingMaster && !isAuthorized) {
      return NextResponse.json(
        { message: 'Apenas o master original pode criar novos masters.' },
        { status: 403 },
      )
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { cpf }] },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Usuário já existe.' },
        { status: 409 },
      )
    }

    const hashed = await bcrypt.hash(password, 10)

    let finalOwnerId = session.user.id

    if (session.user.role === 'admin') {
      const admin = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { ownerId: true },
      })

      if (!admin?.ownerId) {
        return NextResponse.json(
          { message: 'OwnerId não encontrado.' },
          { status: 400 },
        )
      }

      finalOwnerId = admin.ownerId
    }

    await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: hashed,
        role,
        status,
        whatsapp: whatsapp || null,
        adminId: role === 'consultor' ? session.user.id : null,
        ownerId: finalOwnerId,
      },
    })

    return NextResponse.json({ message: 'Usuário criado.' }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
