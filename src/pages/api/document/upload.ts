import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const { userId, orgao, status, fileUrl } = req.body

  if (!userId || !orgao || !status || !fileUrl) {
    return res.status(400).json({ message: 'Campos obrigatórios ausentes.' })
  }

  try {
    await prisma.document.create({
      data: {
        userId,
        orgao,
        status,
        fileUrl,
      },
    })

    return res.status(201).json({ message: 'Documento criado com sucesso.' })
  } catch (error) {
    console.error('Erro ao criar documento:', error)
    return res.status(500).json({ message: 'Erro interno do servidor.' })
  }
}
