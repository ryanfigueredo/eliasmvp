import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token || token.role !== 'master') {
    return res.status(403).json({ message: 'Acesso negado' })
  }

  try {
    const logs = await prisma.log.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // limite para evitar retorno gigante
    })

    res.status(200).json(logs)
  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    res.status(500).json({ message: 'Erro ao buscar logs' })
  }
}
