import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'DELETE') return res.status(405).end()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.id || typeof token.id !== 'string') {
    return res.status(401).json({ message: 'Não autorizado.' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID do documento é obrigatório.' })
  }

  try {
    const documento = await prisma.document.delete({
      where: { id },
    })

    // ⬇️ Registro de log
    await prisma.log.create({
      data: {
        userId: token.id,
        acao: 'EXCLUSÃO DE DOCUMENTO',
        detalhes: `Excluiu o documento ${documento.fileUrl}`,
      },
    })

    return res.status(200).json({ message: 'Documento excluído com sucesso.' })
  } catch (error) {
    console.error('Erro ao excluir documento:', error)
    return res.status(500).json({ message: 'Erro interno ao excluir.' })
  }
}
