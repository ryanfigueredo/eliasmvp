import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next'
import busboy from 'busboy'
import { uploadToS3 } from '@/lib/s3'
import { Orgao, DocumentoStatus } from '@prisma/client'
import { randomUUID } from 'crypto'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.id) {
    return res.status(401).json({ message: 'Não autorizado.' })
  }

  const bb = busboy({ headers: req.headers })

  let userId = ''
  let orgao = ''
  let status = ''
  let fileUrl = ''
  let fileName = ''

  bb.on('field', (name, val) => {
    if (name === 'userId') userId = val
    if (name === 'orgao') orgao = val
    if (name === 'status') status = val
  })

  bb.on('file', async (name, file, info) => {
    const { filename, mimeType } = info
    const chunks: Uint8Array[] = []

    for await (const chunk of file) {
      chunks.push(chunk)
    }

    const buffer = Buffer.concat(chunks)

    // Nome único do arquivo
    fileName = `${Date.now()}-${randomUUID()}-${filename}`

    // Faz o upload para o S3
    fileUrl = await uploadToS3({
      fileBuffer: buffer,
      fileName,
      contentType: mimeType || 'application/octet-stream',
    })
  })

  bb.on('close', async () => {
    if (!userId || !orgao || !status || !fileUrl) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes.' })
    }

    try {
      await prisma.document.create({
        data: {
          userId,
          orgao: orgao as Orgao,
          status: status as DocumentoStatus,
          fileUrl,
        },
      })

      await prisma.log.create({
        data: {
          userId: String(token.id),
          acao: 'UPLOAD DE DOCUMENTO',
          detalhes: `Enviou o documento "${fileName}" com status ${status} para o órgão ${orgao}`,
        },
      })

      return res.status(201).json({ message: 'Documento enviado com sucesso.' })
    } catch (error) {
      console.error('Erro ao salvar no banco:', error)
      return res.status(500).json({ message: 'Erro interno.' })
    }
  })

  req.pipe(bb)
}
