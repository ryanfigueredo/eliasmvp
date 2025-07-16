import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function GET() {
  const email = 'master@elias.com'
  const novaSenha = 'novaSenha123'
  const hash = await bcrypt.hash(novaSenha, 10)

  const user = await prisma.user.update({
    where: { email },
    data: {
      password: hash,
    },
  })

  return NextResponse.json({
    message: 'Senha redefinida com sucesso',
    email: user.email,
    novaSenha,
  })
}
