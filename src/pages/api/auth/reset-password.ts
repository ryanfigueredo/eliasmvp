import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ message: 'Token e senha são obrigatórios.' })
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gte: new Date() },
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'Token inválido ou expirado.' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  })

  return res.status(200).json({ message: 'Senha redefinida com sucesso.' })
}
