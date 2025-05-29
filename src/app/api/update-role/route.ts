import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { id, role } = await req.json()

    if (!id || !role) {
      return NextResponse.json({ message: 'Dados inválidos.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id },
      data: { role },
    })

    return NextResponse.json(
      { message: 'Cargo atualizado com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar cargo.' },
      { status: 500 },
    )
  }
}
