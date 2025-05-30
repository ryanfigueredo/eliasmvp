// src/app/api/dashboard/valores/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { subDays, startOfMonth } from 'date-fns'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')
  const userId = searchParams.get('userId')

  if (!role || !userId) {
    return NextResponse.json(
      { message: 'Parâmetros ausentes.' },
      { status: 400 },
    )
  }

  let userIds: string[] = []

  if (role === 'master') {
    userIds = [] // sem filtro
  } else if (role === 'admin') {
    const consultores = await prisma.user.findMany({
      where: { adminId: userId, role: 'consultor' },
      select: { id: true },
    })
    userIds = [userId, ...consultores.map((c) => c.id)]
  } else if (role === 'consultor') {
    userIds = [userId]
  }

  const whereUser = userIds.length > 0 ? { userId: { in: userIds } } : {}

  const hoje = new Date()
  const inicioMes = startOfMonth(hoje)
  const seteDiasAtras = subDays(hoje, 7)

  try {
    const [mensal, semanal] = await Promise.all([
      prisma.cliente.aggregate({
        _sum: { valor: true },
        where: {
          ...whereUser,
          createdAt: { gte: inicioMes },
        },
      }),
      prisma.cliente.aggregate({
        _sum: { valor: true },
        where: {
          ...whereUser,
          createdAt: { gte: seteDiasAtras },
        },
      }),
    ])

    return NextResponse.json({
      mensal: mensal._sum.valor ?? 0,
      semanal: semanal._sum.valor ?? 0,
    })
  } catch (error) {
    console.error('Erro ao buscar valores:', error)
    return NextResponse.json(
      { message: 'Erro interno ao buscar valores.' },
      { status: 500 },
    )
  }
}
