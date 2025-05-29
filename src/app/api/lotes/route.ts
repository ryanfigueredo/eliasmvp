// src/app/api/lotes/route.ts

import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  let userIds: string[] = []

  if (role === 'master') {
    userIds = []
  } else if (role === 'admin') {
    const consultores = await prisma.user.findMany({
      where: { role: 'consultor', adminId: userId! },
      select: { id: true },
    })
    userIds = [userId!, ...consultores.map((c) => c.id)]
  } else if (role === 'consultor') {
    userIds = [userId!]
  }

  const lotes = await prisma.lote.findMany({
    where:
      userIds.length > 0
        ? {
            OR: [
              {
                documentos: {
                  some: {
                    userId: { in: userIds },
                  },
                },
              },
              {
                criadoPorId: { in: userIds },
              },
            ],
          }
        : {},
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

  try {
    const novoLote = await prisma.lote.create({
      data: {
        nome,
        inicio: new Date(inicio),
        fim: new Date(fim),
        criadoPorId: userId,
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
