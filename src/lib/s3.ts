import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToS3({
  fileBuffer,
  fileName,
  contentType,
}: {
  fileBuffer: Buffer
  fileName: string
  contentType: string
}) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  })

  await s3.send(command)

  // Salva APENAS o caminho da key
  return fileName
}

export async function getS3SignedUrl(key: string) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME!

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }) // 60 segundos
  return signedUrl
}
