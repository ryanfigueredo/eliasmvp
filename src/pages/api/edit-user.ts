import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const { id, name, cpf, email, password, role, status } = req.body

  if (!id || !name || !cpf || !email || !role || !status) {
    return res.status(400).json({ message: 'Dados obrigatórios incompletos.' })
  }

  try {
    const data: any = { name, cpf, email, role, status }

    if (password && password.length >= 6) {
      data.password = await bcrypt.hash(password, 10)
    }

    await prisma.user.update({
      where: { id },
      data,
    })

    return res.status(200).json({ message: 'Usuário atualizado.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao atualizar usuário.' })
  }
}
