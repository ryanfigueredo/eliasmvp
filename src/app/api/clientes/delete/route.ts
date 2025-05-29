import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { id, userId } = body

  if (!id || !userId) {
    return NextResponse.json(
      { message: 'ID e userId são obrigatórios.' },
      { status: 400 },
    )
  }

  try {
    await prisma.cliente.delete({ where: { id } })

    await prisma.log.create({
      data: {
        userId,
        acao: 'EXCLUSÃO DE CLIENTE',
        detalhes: `Deletou o cliente com ID ${id}`,
      },
    })

    return NextResponse.json(
      { message: 'Cliente deletado com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Erro ao deletar cliente.' },
      { status: 500 },
    )
  }
}
