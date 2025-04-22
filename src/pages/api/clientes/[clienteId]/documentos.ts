import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { clienteId } = req.query
  if (req.method !== 'GET' || typeof clienteId !== 'string')
    return res.status(405).end()

  try {
    const documentos = await prisma.documentoCliente.findMany({
      where: { clienteId },
      select: { id: true, tipo: true, fileUrl: true },
      orderBy: { createdAt: 'asc' },
    })

    return res.status(200).json(documentos)
  } catch (error) {
    console.error('Erro ao buscar documentos do cliente:', error)
    return res.status(500).json({ message: 'Erro interno do servidor.' })
  }
}
