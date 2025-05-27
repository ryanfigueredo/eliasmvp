import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import fs from 'fs/promises'
import path from 'path'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'DELETE') return res.status(405).end()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token || (token.role !== 'master' && token.role !== 'admin')) {
    return res.status(403).json({ message: 'Não autorizado.' })
  }

  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'ID inválido.' })
  }

  try {
    const doc = await prisma.document.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!doc) {
      return res.status(404).json({ message: 'Documento não encontrado.' })
    }

    // Deletar arquivo físico (caso não esteja no S3)
    const filePath = path.join(process.cwd(), 'public', doc.fileUrl)
    await fs.unlink(filePath).catch((err) => {
      console.warn(
        'Erro ao excluir arquivo físico (pode não existir):',
        err.message,
      )
    })

    await prisma.document.delete({ where: { id } })

    await prisma.log.create({
      data: {
        userId: token.id as string,
        acao: 'EXCLUSÃO DE DOCUMENTO',
        detalhes: `Documento ${doc.fileUrl} (${doc.orgao}) foi excluído por ${token.name || token.email}.`,
      },
    })

    return res.status(200).json({ message: 'Documento excluído com sucesso.' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao excluir documento.' })
  }
}
