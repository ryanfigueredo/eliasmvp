import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { method } = req
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID inválido.' })
  }

  if (method === 'DELETE') {
    try {
      const user = await prisma.user.delete({
        where: { id },
      })
      return res.status(200).json(user)
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao excluir o usuário' })
    }
  }

  if (method === 'PUT') {
    const session = await getServerSession(req, res, authOptions)

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Não autenticado.' })
    }

    const { name, status, role } = req.body
    const updates: any = {}

    if (name) updates.name = name
    if (status) updates.status = status

    // Só masters podem alterar o cargo (role)
    if (role) {
      if (session.user.role !== 'master') {
        return res
          .status(403)
          .json({ message: 'Apenas o master pode alterar o cargo.' })
      }
      updates.role = role
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updates,
      })
      return res.status(200).json(updatedUser)
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      return res.status(500).json({ message: 'Erro ao atualizar usuário.' })
    }
  }

  return res.status(405).json({ message: 'Método não permitido.' })
}
