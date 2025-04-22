import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req
  const { id } = req.query

  if (method === 'DELETE') {
    try {
      const user = await prisma.user.delete({
        where: { id: id as string },
      })
      return res.status(200).json(user)
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao excluir o usuário' })
    }
  } else {
    return res.status(405).json({ message: 'Método não permitido' })
  }
}
