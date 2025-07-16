import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { uploadFile } from '@/lib/upload'
import { getSignedUrl } from '@/lib/upload'

export async function POST(req: Request) {
  const data = await req.formData()
  const file = data.get('file') as File
  const userId = data.get('userId') as string

  if (!file || !userId) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  const uploadResult = await uploadFile(file) // deve retornar a key do arquivo

  const config = await prisma.config.upsert({
    where: { userId },
    update: { logo: uploadResult.key },
    create: {
      userId,
      logo: uploadResult.key,
    },
  })

  return NextResponse.json({ config })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId)
    return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

  const config = await prisma.config.findUnique({
    where: { userId },
  })

  if (!config?.logo) return NextResponse.json({ url: null })

  const url = await getSignedUrl(config.logo)
  return NextResponse.json({ url })
}
