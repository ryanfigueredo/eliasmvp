import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { withLogging } from '@/lib/api-handler'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import logger from '@/lib/logger'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

async function presignUpload(req: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(req)
    const rateLimitResult = rateLimit(`presign:${clientIP}`, 20, 60_000) // 20 req/min

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': (rateLimitResult.retryAfter || 60).toString(),
          },
        },
      )
    }

    const { key, contentType, fileSize } = await req.json()

    if (!key || !contentType) {
      return NextResponse.json(
        { error: 'Missing key or contentType' },
        { status: 400 },
      )
    }

    // Validação de tamanho (50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (fileSize && fileSize > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Max 50MB' },
        { status: 400 },
      )
    }

    // Validação de tipo MIME
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      ContentType: contentType,
    })

    const url = await getSignedUrl(s3, command, { expiresIn: 300 }) // 5 minutos

    logger.info({
      action: 'presign_upload',
      key,
      contentType,
      fileSize,
      clientIP,
    })

    return NextResponse.json({
      url,
      key,
      expiresIn: 300,
      remaining: rateLimitResult.remaining,
    })
  } catch (error) {
    logger.error({
      action: 'presign_upload_error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 },
    )
  }
}

export const POST = withLogging(presignUpload)
