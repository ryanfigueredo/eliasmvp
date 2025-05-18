import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  const { role, userId } = req.query

  if (
    !role ||
    !userId ||
    typeof role !== 'string' ||
    typeof userId !== 'string'
  ) {
    return res
      .status(400)
      .json({ message: 'Parâmetros ausentes ou inválidos.' })
  }

  try {
    let whereClause = {}

    if (role === 'consultor') {
      whereClause = { userId }
    } else if (role === 'admin') {
      whereClause = {
        user: {
          OR: [{ id: userId }, { adminId: userId }],
        },
      }
    }

    const [iniciado, andamento, finalizado] = await Promise.all([
      prisma.document.count({ where: { ...whereClause, status: 'INICIADO' } }),
      prisma.document.count({
        where: { ...whereClause, status: 'EM_ANDAMENTO' },
      }),
      prisma.document.count({
        where: { ...whereClause, status: 'FINALIZADO' },
      }),
    ])

    return res.status(200).json({
      iniciado,
      andamento,
      finalizado,
    })
  } catch (error) {
    console.error('Erro ao buscar status dos documentos:', error)
    return res.status(500).json({ message: 'Erro interno.' })
  }
}
