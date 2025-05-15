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

  const documentos = await prisma.document.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: { select: { name: true } },
      lote: true,
    },
  })

  return res.status(200).json(documentos)
}
