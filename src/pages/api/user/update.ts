import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { writeFile } from 'fs/promises'
import path from 'path'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.id) {
    res.status(401).json({ message: 'Não autorizado' })
    return
  }

  const form = formidable({ multiples: false })
  console.log('Token recebido:', token)

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ message: 'Erro ao processar formulário.' })
      return
    }

    const nome = fields.nome?.toString()
    const email = fields.email?.toString()
    const senha = fields.senha?.toString()
    const foto = files.foto as formidable.File | undefined

    const updateData: any = {}

    if (nome) updateData.name = nome
    if (email) updateData.email = email
    if (senha) updateData.password = await bcrypt.hash(senha, 10)

    if (foto) {
      const fileName = `${Date.now()}-${foto.originalFilename}`
      const filePath = path.join(process.cwd(), 'public/uploads', fileName)
      const fileBuffer = await fs.promises.readFile(foto.filepath)
      if (fileBuffer) {
        await writeFile(filePath, fileBuffer)
        updateData.image = `/uploads/${fileName}`
      }
    }

    try {
      await prisma.user.update({
        where: { id: token.id as string },
        data: updateData,
      })

      res.status(200).json({ message: 'Atualizado com sucesso.' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Erro interno.' })
    }
  })
}
