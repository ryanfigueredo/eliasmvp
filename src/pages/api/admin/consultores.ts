// src/pages/api/admin/consultores.ts
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
  if (!session?.user || session.user.role !== 'admin') {
    return res.status(401).json({ message: 'Não autorizado' })
  }

  try {
    const consultores = await prisma.user.findMany({
      where: {
        adminId: session.user.id,
        role: 'consultor',
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
    })

    return res.status(200).json(consultores)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao buscar consultores.' })
  }
}
