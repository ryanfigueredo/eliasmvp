import { NextRequest, NextResponse } from 'next/server'
import { s3 } from '@/lib/s3'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')

  if (!key) {
    return NextResponse.json(
      { message: 'Parâmetro key obrigatório.' },
      { status: 400 },
    )
  }

  try {
    const bucketName = process.env.AWS_S3_BUCKET!
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }) // 5 minutos
    return NextResponse.json({ url: signedUrl })
  } catch (error) {
    console.error('Erro ao gerar signed URL:', error)
    return NextResponse.json(
      { message: 'Erro ao gerar URL temporária.' },
      { status: 500 },
    )
  }
}
