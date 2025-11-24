// src/app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, cpf, whatsapp, password } = await req.json()

    if (!name || !email || !cpf || !password) {
      return NextResponse.json(
        { message: 'Nome, E-mail, CPF e Senha são obrigatórios.' },
        { status: 400 },
      )
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { cpf }] },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'E-mail ou CPF já cadastrados.' },
        { status: 409 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        whatsapp: whatsapp || null,
        password: hashedPassword,
        role: 'consultor',
        status: 'aguardando',
      },
    })

    return NextResponse.json(
      { message: 'Cadastro enviado. Aguarde aprovação.' },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error)
    return NextResponse.json(
      { message: 'Erro ao cadastrar usuário.' },
      { status: 500 },
    )
  }
}
