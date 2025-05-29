import type { NextApiRequest, NextApiResponse } from 'next'
import { s3 } from '@/lib/s3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  const { key } = req.query

  if (!key || typeof key !== 'string') {
    return res.status(400).json({ message: 'Parâmetro key obrigatório.' })
  }

  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME! // 👈 este é o correto
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 }) // 5 minutos
    return res.status(200).json({ url: signedUrl })
  } catch (error) {
    console.error('Erro ao gerar signed URL:', error)
    return res.status(500).json({ message: 'Erro ao gerar URL temporária.' })
  }
}
