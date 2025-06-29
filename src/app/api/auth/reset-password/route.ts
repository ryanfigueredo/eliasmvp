import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token e senha são obrigatórios.' },
        { status: 400 },
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Token inválido ou expirado.' },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json(
      { message: 'Senha redefinida com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erro na redefinição de senha:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor.' },
      { status: 500 },
    )
  }
}
