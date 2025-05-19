import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const role = req.headers['x-user-role']?.toString()
    const userId = req.headers['x-user-id']?.toString()

    let userIds: string[] = []

    if (role === 'master') {
      // master vê tudo
      userIds = []
    } else if (role === 'admin') {
      const consultores = await prisma.user.findMany({
        where: { role: 'consultor', adminId: userId },
        select: { id: true },
      })
      userIds = [userId!, ...consultores.map((c) => c.id)]
    } else if (role === 'consultor') {
      userIds = [userId!]
    }

    const lotes = await prisma.lote.findMany({
      where:
        userIds.length > 0
          ? {
              documentos: {
                some: {
                  userId: { in: userIds },
                },
              },
            }
          : {},
      orderBy: { inicio: 'desc' },
    })

    return res.status(200).json(lotes)
  }

  if (req.method === 'POST') {
    const { nome, inicio, fim } = req.body

    if (!nome || !inicio || !fim) {
      return res.status(400).json({ message: 'Dados obrigatórios ausentes.' })
    }

    try {
      const novoLote = await prisma.lote.create({
        data: {
          nome,
          inicio: new Date(inicio),
          fim: new Date(fim),
        },
      })

      return res.status(201).json(novoLote)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Erro ao criar lote.' })
    }
  }

  return res.status(405).end()
}
