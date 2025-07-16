import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !userId) {
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
      { message: 'Usuário sem master vinculado.' },
      { status: 400 },
    )
  }

  let userIds: string[] = []

  if (role === 'master') {
    userIds = [] // master vê todos os seus
  } else if (role === 'admin') {
    const consultores = await prisma.user.findMany({
      where: { role: 'consultor', adminId: userId },
      select: { id: true },
    })
    userIds = [userId, ...consultores.map((c) => c.id)]
  } else if (role === 'consultor') {
    userIds = [userId]
  }

  const lotes = await prisma.lote.findMany({
    where: {
      ownerId,
      ...(userIds.length > 0
        ? {
            OR: [
              { documentos: { some: { userId: { in: userIds } } } },
              { criadoPorId: { in: userIds } },
            ],
          }
        : {}),
    },
    orderBy: { inicio: 'desc' },
  })

  return NextResponse.json(lotes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nome, inicio, fim, userId } = body

  if (!nome || !inicio || !fim || !userId) {
    return NextResponse.json(
      { message: 'Dados obrigatórios ausentes.' },
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
      { message: 'Usuário sem master vinculado.' },
      { status: 400 },
    )
  }

  try {
    const novoLote = await prisma.lote.create({
      data: {
        nome,
        inicio: new Date(inicio),
        fim: new Date(fim),
        criadoPorId: userId,
        ownerId,
      },
    })
    return NextResponse.json(novoLote, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Erro ao criar lote.' },
      { status: 500 },
    )
  }
}
