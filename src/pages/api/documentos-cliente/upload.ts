// src/pages/api/documentos-cliente/upload.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { v4 as uuid } from 'uuid'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import busboy from 'busboy'

export const config = {
  api: {
    bodyParser: false,
  },
}

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const bb = busboy({ headers: req.headers })
  const uploads: Promise<void>[] = []

  let clienteId = ''

  bb.on('field', (name, val) => {
    if (name === 'clienteId') clienteId = val
  })

  bb.on('file', (name, file, info) => {
    const tipo = name // 'rg', 'consulta', etc.
    const filename = `${Date.now()}-${uuid()}-${info.filename}`
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${filename}`

    uploads.push(
      (async () => {
        const chunks: Uint8Array[] = []
        for await (const chunk of file) {
          chunks.push(chunk)
        }

        const buffer = Buffer.concat(chunks)

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: filename,
            Body: buffer,
            ContentType: info.mimeType,
            ACL: 'public-read',
          }),
        )

        await prisma.documentoCliente.create({
          data: {
            clienteId,
            tipo: tipo.toUpperCase(),
            fileUrl,
          },
        })
      })(),
    )
  })

  bb.on('close', async () => {
    try {
      await Promise.all(uploads)
      return res.status(201).json({ message: 'Documentos do cliente salvos.' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Erro ao salvar documentos.' })
    }
  })

  req.pipe(bb)
}
