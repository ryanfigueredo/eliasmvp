import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { subDays, startOfMonth } from 'date-fns'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { role, userId } = req.query

  if (
    !role ||
    !userId ||
    typeof role !== 'string' ||
    typeof userId !== 'string'
  ) {
    return res.status(400).json({ message: 'Parâmetros ausentes.' })
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

  const whereFilter = {
    AND: [userIds.length > 0 ? { userId: { in: userIds } } : {}],
  }

  const hoje = new Date()
  const inicioMes = startOfMonth(hoje)
  const seteDiasAtras = subDays(hoje, 7)

  const [mensal, semanal] = await Promise.all([
    prisma.cliente.aggregate({
      _sum: { valor: true },
      where: {
        ...whereFilter,
        createdAt: { gte: inicioMes },
      },
    }),
    prisma.cliente.aggregate({
      _sum: { valor: true },
      where: {
        ...whereFilter,
        createdAt: { gte: seteDiasAtras },
      },
    }),
  ])

  return res.status(200).json({
    mensal: mensal._sum.valor ?? 0,
    semanal: semanal._sum.valor ?? 0,
  })
}
