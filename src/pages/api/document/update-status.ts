import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const { id, status } = req.body

  if (!id || !status)
    return res.status(400).json({ message: 'Dados incompletos.' })

  try {
    await prisma.document.update({
      where: { id },
      data: { status },
    })

    return res.status(200).json({ message: 'Status atualizado.' })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return res.status(500).json({ message: 'Erro no servidor.' })
  }
}
