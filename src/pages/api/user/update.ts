import { prisma } from '@/lib/prisma'
import { uploadToS3 } from '@/lib/s3'
import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcrypt'
import formidable from 'formidable'
import fs from 'fs/promises'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido.' })
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.id) {
    return res.status(401).json({ message: 'Não autorizado' })
  }

  const form = formidable({ multiples: false, keepExtensions: true })

  try {
    const [fields, files] = await new Promise<
      [formidable.Fields, formidable.Files]
    >((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    const nome = fields.nome?.toString()
    const email = fields.email?.toString()
    const senha = fields.senha?.toString()
    const foto = files.foto as formidable.File | undefined

    const updateData: any = {}

    if (nome) updateData.name = nome
    if (email) updateData.email = email
    if (senha) updateData.password = await bcrypt.hash(senha, 10)

    if (foto && foto.filepath) {
      const fileBuffer = await fs.readFile(foto.filepath)
      const fileName = `avatars/${Date.now()}-${foto.originalFilename}`
      const contentType = foto.mimetype || 'image/jpeg'

      const fileUrl = await uploadToS3({
        fileBuffer,
        fileName,
        contentType,
      })

      updateData.image = fileUrl
    }

    await prisma.user.update({
      where: { id: token.id as string },
      data: updateData,
    })

    return res.status(200).json({ message: 'Usuário atualizado com sucesso.' })
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error)
    return res
      .status(500)
      .json({ message: 'Erro interno ao atualizar usuário.' })
  }
}
