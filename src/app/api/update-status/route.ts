import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { id, status } = await req.json()

    if (!id || !['aprovado', 'aguardando', 'inativo'].includes(status)) {
      return NextResponse.json({ message: 'Dados inválidos.' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id },
      data: { status },
    })

    return NextResponse.json(
      { message: 'Status atualizado com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar status.' },
      { status: 500 },
    )
  }
}
