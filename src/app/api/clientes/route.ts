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

    const currentUser = await prisma.user.findUnique({
      where: { id: responsavelId },
      select: { role: true, ownerId: true },
    })

    const ownerId =
      currentUser?.role === 'master' ? responsavelId : currentUser?.ownerId

    if (!ownerId) {
      return NextResponse.json(
        { message: 'Usuário sem master vinculado.' },
        { status: 400 },
      )
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        cpfCnpj,
        valor: parsedValor,
        user: {
          connect: { id: responsavelId },
        },
        owner: {
          connect: { id: ownerId },
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

  const userId = req.headers.get('x-user-id')
  const role = req.headers.get('x-user-role')

  if (!userId || !role) {
    return NextResponse.json(
      { message: 'Cabeçalhos ausentes.' },
      { status: 400 },
    )
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, ownerId: true },
  })

  const ownerId = currentUser?.role === 'master' ? userId : currentUser?.ownerId

  if (!ownerId) {
    return NextResponse.json(
      { message: 'Usuário sem owner vinculado.' },
      { status: 400 },
    )
  }

  try {
    const clientes = await prisma.cliente.findMany({
      where: {
        ownerId,
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
