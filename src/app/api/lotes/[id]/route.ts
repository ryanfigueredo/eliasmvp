import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { loteId: string } },
) {
  const { loteId } = params

  if (!loteId) {
    return NextResponse.json({ message: 'ID inválido.' }, { status: 400 })
  }

  try {
    await prisma.lote.delete({
      where: { id: loteId },
    })

    return new Response(null, { status: 204 }) // sem conteúdo
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Erro ao deletar lote.' },
      { status: 500 },
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { loteId: string } },
) {
  const { loteId } = params
  const body = await req.json()

  if (!loteId || !body?.nome || !body?.inicio || !body?.fim) {
    return NextResponse.json(
      { message: 'Dados inválidos para atualização.' },
      { status: 400 },
    )
  }

  try {
    const loteAtualizado = await prisma.lote.update({
      where: { id: loteId },
      data: {
        nome: body.nome,
        inicio: new Date(body.inicio),
        fim: new Date(body.fim),
      },
    })

    return NextResponse.json(loteAtualizado)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Erro ao atualizar lote.' },
      { status: 500 },
    )
  }
}
