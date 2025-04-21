import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const { id, status } = req.body

  if (!id || !['aprovado', 'aguardando', 'inativo'].includes(status)) {
    return res.status(400).json({ message: 'Dados inválidos.' })
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { status },
    })

    return res.status(200).json({ message: 'Status atualizado com sucesso.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao atualizar status.' })
  }
}
