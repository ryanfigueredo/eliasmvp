// /src/pages/api/users/index.ts
import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { role } = req.query

  if (!role || typeof role !== 'string') {
    return res.status(400).json({ message: 'Role obrigatória.' })
  }

  try {
    const users = await prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return res.status(200).json(users)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao buscar usuários.' })
  }
}
