import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { loteId } = req.query

  if (typeof loteId !== 'string') {
    return res.status(400).json({ message: 'ID inválido.' })
  }

  if (req.method === 'PUT') {
    const { nome, inicio, fim } = req.body

    try {
      const loteAtualizado = await prisma.lote.update({
        where: { id: loteId },
        data: {
          nome,
          inicio: new Date(inicio),
          fim: new Date(fim),
        },
      })

      return res.status(200).json(loteAtualizado)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Erro ao atualizar lote.' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.lote.delete({ where: { id: loteId } })
      return res.status(204).end()
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Erro ao deletar lote.' })
    }
  }

  return res.status(405).end()
}
