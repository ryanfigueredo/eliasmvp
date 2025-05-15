// src/pages/api/stats/document-status.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  const { role, userId } = req.query

  if (!role || !userId) {
    return res.status(400).json({ message: 'Parâmetros ausentes.' })
  }

  try {
    const whereClause =
      role === 'master'
        ? {} // master vê tudo
        : { userId: userId as string } // admin/consultor só vê o que criou

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
    console.error(error)
    return res.status(500).json({ message: 'Erro interno.' })
  }
}
