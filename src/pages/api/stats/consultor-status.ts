import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'ID inválido.' })
  }

  try {
    const [iniciado, andamento, finalizado] = await Promise.all([
      prisma.document.count({
        where: { userId, status: 'INICIADO' },
      }),
      prisma.document.count({
        where: { userId, status: 'EM_ANDAMENTO' },
      }),
      prisma.document.count({
        where: { userId, status: 'FINALIZADO' },
      }),
    ])

    return res.status(200).json({
      INICIADO: iniciado,
      EM_ANDAMENTO: andamento,
      FINALIZADO: finalizado,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erro interno.' })
  }
}
