import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { v4 as uuid } from 'uuid'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import busboy from 'busboy'

export const config = {
  api: { bodyParser: false },
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
  let userId = ''
  let loteId = ''
  let valor = 0

  const agrupadorId = uuid()

  bb.on('field', (name, val) => {
    if (name === 'clienteId') clienteId = val
    if (name === 'responsavelId') userId = val
    if (name === 'loteId') loteId = val
    if (name === 'valor') valor = parseFloat(val)
  })

  bb.on('file', (name, file, info) => {
    const tipo = name.toUpperCase()
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
          }),
        )

        await prisma.document.create({
          data: {
            clienteId,
            userId,
            loteId,
            valor,
            agrupadorId,
            tipo,
            fileUrl,
            orgao: 'SERASA',
            status: 'INICIADO',
          },
        })
      })(),
    )
  })

  bb.on('close', async () => {
    try {
      await Promise.all(uploads)
      return res
        .status(201)
        .json({ message: 'Documentos enviados com sucesso.' })
    } catch (error) {
      console.error('Erro ao salvar documentos:', error)
      return res.status(500).json({ message: 'Erro interno no servidor.' })
    }
  })

  req.pipe(bb)
}
