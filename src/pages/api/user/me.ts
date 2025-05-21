// src/pages/api/user/me.ts

import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token?.id) {
    return res.status(401).json({ message: 'Não autenticado' })
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { name: true, email: true, image: true },
  })

  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })

  return res.status(200).json(user)
}
