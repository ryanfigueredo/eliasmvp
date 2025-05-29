import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user) return res.status(401).end()

  const where =
    session.user.role === 'master' ? {} : { userId: session.user.id }

  const statusCounts = await prisma.document.groupBy({
    by: ['status'],
    where,
    _count: { status: true },
  })

  const result = {
    INICIADO: 0,
    EM_ANDAMENTO: 0,
    FINALIZADO: 0,
  }

  statusCounts.forEach((item) => {
    result[item.status] = item._count.status
  })

  return res.status(200).json(result)
}
