import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const email = 'ryan@dmtn.com.br'
  const plainPassword = '123456'
  const hash = await bcrypt.hash(plainPassword, 10)

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 })
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      name: 'Ryan',
      cpf: '00000000001',
      role: 'master',
      status: 'aprovado',
    },
  })

  return NextResponse.json({
    msg: 'Usuário master criado com sucesso!',
    login: {
      email,
      senha: plainPassword,
    },
    id: user.id,
  })
}
