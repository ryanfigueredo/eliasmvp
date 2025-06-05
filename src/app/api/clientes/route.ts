import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 👉 POST: criar novo cliente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nome, cpfCnpj, responsavelId, valor } = body

    if (
      !nome ||
      !cpfCnpj ||
      !responsavelId ||
      valor === undefined ||
      valor === null
    ) {
      return NextResponse.json(
        { message: 'Campos obrigatórios ausentes' },
        { status: 400 },
      )
    }

    const parsedValor = Number(String(valor).replace(',', '.'))

    if (isNaN(parsedValor)) {
      return NextResponse.json(
        { message: 'Valor inválido enviado.' },
        { status: 400 },
      )
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        cpfCnpj,
        valor: parsedValor,
        user: {
          connect: {
            id: responsavelId,
          },
        },
      },
    })

    return NextResponse.json({ id: cliente.id }, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'CPF/CNPJ já cadastrado.' },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { message: 'Erro interno ao criar cliente' },
      { status: 500 },
    )
  }
}

// 👉 GET: buscar clientes por nome ou CPF/CNPJ
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca') || ''

  try {
    const clientes = await prisma.cliente.findMany({
      where: {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { cpfCnpj: { contains: busca, mode: 'insensitive' } },
        ],
      },
      take: 10,
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 },
    )
  }
}
