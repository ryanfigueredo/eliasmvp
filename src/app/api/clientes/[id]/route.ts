import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params
    const body = await req.json()
    const { limite } = body

    if (!id) {
      return NextResponse.json(
        { message: 'ID do cliente é obrigatório' },
        { status: 400 },
      )
    }

    // Validar limite se fornecido
    if (limite !== undefined && limite !== null) {
      const parsedLimite = Number(String(limite).replace(',', '.'))

      if (isNaN(parsedLimite)) {
        return NextResponse.json(
          { message: 'Limite inválido' },
          { status: 400 },
        )
      }

      if (parsedLimite < 500) {
        return NextResponse.json(
          { message: 'O limite mínimo é de R$ 500,00' },
          { status: 400 },
        )
      }

      // Atualizar apenas o limite
      const cliente = await prisma.cliente.update({
        where: { id },
        data: { limite: parsedLimite },
      })

      return NextResponse.json(
        { message: 'Limite atualizado com sucesso', cliente },
        { status: 200 },
      )
    }

    return NextResponse.json(
      { message: 'Nenhum dado para atualizar' },
      { status: 400 },
    )
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'Cliente não encontrado' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { message: 'Erro interno ao atualizar cliente' },
      { status: 500 },
    )
  }
}
