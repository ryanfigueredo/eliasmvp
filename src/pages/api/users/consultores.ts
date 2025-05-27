import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'consultor'],
        },
        status: 'aprovado',
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    })

    return res.status(200).json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return res.status(500).json({ message: 'Erro interno do servidor.' })
  }
}
