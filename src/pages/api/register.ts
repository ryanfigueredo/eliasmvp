import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email, cpf, password } = req.body

  if (!email || !cpf || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { cpf }] },
    })

    if (existingUser) {
      return res.status(409).json({ message: 'E-mail ou CPF já cadastrados.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        cpf,
        password: hashedPassword,
        role: 'consultor',
        status: 'aguardando',
      },
    })

    return res.status(201).json({ message: 'Cadastro enviado. Aguarde aprovação.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao cadastrar usuário.' })
  }
}
