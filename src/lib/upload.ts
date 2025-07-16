import { getS3SignedUrl, uploadToS3 } from './s3'
import { randomUUID } from 'crypto'

// Converte File para Buffer (Next.js API Routes)
export async function uploadFile(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const fileExtension = file.name.split('.').pop()
  const key = `logos/${randomUUID()}.${fileExtension}`

  await uploadToS3({
    fileBuffer: buffer,
    fileName: key,
    contentType: file.type,
  })

  return { key }
}

export async function getSignedUrl(key: string) {
  return await getS3SignedUrl(key)
}
