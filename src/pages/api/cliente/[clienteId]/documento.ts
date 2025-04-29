// src/pages/api/cliente/[clienteId]/documentos.ts

import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from 'next-auth/jwt'
import formidable from 'formidable'
import path from 'path'
import fs from 'fs/promises'

export const config = {
  api: {
    bodyParser: false, // Importante para upload funcionar
  },
}

// Função auxiliar para parsear form data
function parseForm(req: NextApiRequest) {
  const form = new formidable.IncomingForm({ multiples: false })

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
    (resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    },
  )
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { clienteId } = req.query

  if (!clienteId || typeof clienteId !== 'string') {
    return res.status(400).json({ message: 'ID do cliente é obrigatório.' })
  }

  if (req.method === 'GET') {
    const documentos = await prisma.documentoCliente.findMany({
      where: { clienteId },
      select: {
        id: true,
        tipo: true,
        fileUrl: true,
      },
    })

    return res.status(200).json(documentos)
  }

  if (req.method === 'POST') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token?.id) {
      return res.status(401).json({ message: 'Não autorizado.' })
    }

    try {
      const { fields, files } = await parseForm(req)

      const tipo = fields.tipo?.toString()
      const file = files.file as formidable.File

      if (!tipo || !file) {
        return res
          .status(400)
          .json({ message: 'Campos obrigatórios ausentes.' })
      }

      const fileName = `${Date.now()}-${file.originalFilename}`
      const uploadPath = path.join(process.cwd(), 'public/uploads', fileName)

      const data = await fs.readFile(file.filepath)
      await fs.writeFile(uploadPath, data)

      await prisma.documentoCliente.create({
        data: {
          clienteId,
          tipo,
          fileUrl: `/uploads/${fileName}`,
        },
      })

      return res.status(201).json({ message: 'Documento enviado com sucesso.' })
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error)
      return res.status(500).json({ message: 'Erro interno.' })
    }
  }

  return res.status(405).json({ message: 'Método não permitido.' })
}
