import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const lote = await prisma.lote.findUnique({
      where: { id: params.id },
      select: { id: true, nome: true, status: true },
    })

    if (!lote) {
      return NextResponse.json(
        { error: 'Lote não encontrado' },
        { status: 404 },
      )
    }

    return NextResponse.json(lote)
  } catch (error) {
    console.error('Erro ao buscar lote:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { status } = await req.json()

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
        { status: 400 },
      )
    }

    const lote = await prisma.lote.update({
      where: { id: params.id },
      data: { status },
      select: { id: true, nome: true, status: true },
    })

    return NextResponse.json(lote)
  } catch (error) {
    console.error('Erro ao atualizar lote:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    )
  }
}
