import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, cpf, email, password, role, status, adminId } = body

    if (!email || !password || !cpf) {
      return NextResponse.json(
        { message: 'Campos obrigatórios.' },
        { status: 400 },
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

    await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: hashed,
        role,
        status,
        adminId: role === 'consultor' ? adminId : null,
      },
    })

    return NextResponse.json({ message: 'Usuário criado.' }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
