import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.id) {
    return res.status(401).json({ message: 'Não autorizado.' })
  }

  const { id, status } = req.body
  const statusPermitidos = ['INICIADO', 'EM_ANDAMENTO', 'FINALIZADO']

  if (!id || !status || !statusPermitidos.includes(status)) {
    return res.status(400).json({ message: 'Dados inválidos.' })
  }

  try {
    const documento = await prisma.document.update({
      where: { id },
      data: { status },
    })

    await prisma.log.create({
      data: {
        userId: String(token.id),
        acao: 'ALTERAÇÃO DE STATUS',
        detalhes: `Alterou status do documento "${documento.fileUrl}" para ${status}`,
      },
    })

    return res.status(200).json({ message: 'Status atualizado.' })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return res.status(500).json({ message: 'Erro interno.' })
  }
}
