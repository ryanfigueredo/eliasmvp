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
  let valor = ''
  const arquivos: {
    tipo: string
    buffer: Uint8Array[]
    filename: string
    mimeType: string
  }[] = []

  // 🚨 Aqui está o agrupador que será o mesmo para todos os arquivos enviados
  const agrupadorId = uuid()

  bb.on('field', (name, val) => {
    if (name === 'clienteId') clienteId = val
    if (name === 'responsavelId') userId = val
    if (name === 'loteId') loteId = val
    if (name === 'valor') valor = val
  })

  bb.on('file', (name, file, info) => {
    const filename = `${Date.now()}-${uuid()}-${info.filename}`
    const buffer: Uint8Array[] = []

    file.on('data', (data) => buffer.push(data))
    file.on('end', () => {
      arquivos.push({
        tipo: name.toUpperCase(),
        buffer,
        filename,
        mimeType: info.mimeType,
      })
    })
  })

  bb.on('close', async () => {
    try {
      if (!clienteId || !userId || !loteId || !valor) {
        return res
          .status(400)
          .json({ message: 'Campos obrigatórios faltando.' })
      }

      for (const arq of arquivos) {
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: arq.filename,
            Body: Buffer.concat(arq.buffer),
            ContentType: arq.mimeType,
          }),
        )

        const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${arq.filename}`

        await prisma.document.create({
          data: {
            clienteId,
            userId,
            loteId,
            valor: parseFloat(valor),
            agrupadorId, // ✅ agora será salvo corretamente
            tipo: arq.tipo,
            fileUrl,
            orgao: 'SERASA',
            status: 'INICIADO',
          },
        })
      }

      return res.status(201).json({ message: 'Documentos salvos com sucesso.' })
    } catch (error) {
      console.error('❌ Erro no upload:', error)
      return res.status(500).json({ message: 'Erro ao salvar documentos.' })
    }
  })

  req.pipe(bb)
}
