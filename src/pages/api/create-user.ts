import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, cpf, email, password, role, status, adminId } = req.body

  if (!email || !password || !cpf)
    return res.status(400).json({ message: 'Campos obrigatórios.' })

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { cpf }] },
    })

    if (existing) return res.status(409).json({ message: 'Usuário já existe.' })

    const hashed = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        password: hashed,
        role,
        status,
        adminId: role === 'consultor' ? adminId : null,
      },
    })

    return res.status(201).json({ message: 'Usuário criado.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro interno.' })
  }
}
