// src/app/api/user/update/route.ts
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { uploadToS3 } from '@/lib/s3'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token?.id) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const nome = formData.get('nome') as string
    const email = formData.get('email') as string
    const senha = formData.get('senha') as string
    const foto = formData.get('foto') as File | null

    const updateData: any = {}

    if (nome) updateData.name = nome
    if (email) updateData.email = email
    if (senha) updateData.password = await bcrypt.hash(senha, 10)

    if (foto && foto.size > 0) {
      const buffer = Buffer.from(await foto.arrayBuffer())
      const fileName = `avatars/${Date.now()}-${foto.name}`

      await uploadToS3({
        fileBuffer: buffer,
        fileName,
        contentType: foto.type,
      })

      updateData.image = fileName
    }

    await prisma.user.update({
      where: { id: String(token.id) },
      data: updateData,
    })

    return NextResponse.json({
      message: 'Usuário atualizado',
      image: updateData.image,
    })
  } catch (err) {
    console.error('❌ Erro ao atualizar perfil:', err)
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 })
  }
}
