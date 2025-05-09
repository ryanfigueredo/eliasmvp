// src/pages/api/lotes.ts

import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  try {
    const lotes = await prisma.lote.findMany({
      orderBy: { inicio: 'desc' },
      select: {
        id: true,
        nome: true,
        inicio: true,
        fim: true,
      },
    })

    return res.status(200).json(lotes)
  } catch (error) {
    console.error('Erro ao buscar lotes:', error)
    return res.status(500).json({ message: 'Erro interno do servidor.' })
  }
}
