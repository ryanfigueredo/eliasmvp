import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { id, nome, cpfCnpj, valor } = body

  if (!id || !nome || !cpfCnpj || valor === undefined) {
    return NextResponse.json(
      { message: 'Todos os campos são obrigatórios.' },
      { status: 400 },
    )
  }

  try {
    await prisma.cliente.update({
      where: { id },
      data: { nome, cpfCnpj, valor },
    })

    return NextResponse.json(
      { message: 'Cliente atualizado com sucesso.' },
      { status: 200 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Erro ao atualizar cliente.' },
      { status: 500 },
    )
  }
}
