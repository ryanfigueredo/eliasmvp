import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const email = 'master2@elias.com'
  const plainPassword = 'senha123'
  const hash = await bcrypt.hash(plainPassword, 10)

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: 'Usuário já existe' }, { status: 400 })
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hash,
      name: 'Novo Master',
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
