import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { id, name, cpf, email, password, role, status } = body

    if (!id || !name || !cpf || !email || !role || !status) {
      return NextResponse.json(
        { message: 'Dados obrigatórios incompletos.' },
        { status: 400 },
      )
    }

    const data: any = { name, cpf, email, role, status }

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
