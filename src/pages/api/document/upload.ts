import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()

  const chunks: Uint8Array[] = []
  const busboy = require('busboy')
  const bb = busboy({ headers: req.headers })

  let userId = ''
  let orgao = ''
  let status = ''
  let fileUrl = ''

  bb.on('field', (name, val) => {
    if (name === 'userId') userId = val
    if (name === 'orgao') orgao = val
    if (name === 'status') status = val
  })

  bb.on('file', async (name, file, info) => {
    const { filename } = info
    const uniqueName = `${Date.now()}-${uuid()}-${filename}`
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', uniqueName)

    fileUrl = `/uploads/${uniqueName}`

    for await (const chunk of file) {
      chunks.push(chunk)
    }

    await writeFile(uploadPath, Buffer.concat(chunks))
  })

  bb.on('close', async () => {
    if (!userId || !orgao || !status || !fileUrl) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes.' })
    }

    await prisma.document.create({
      data: {
        userId,
        orgao,
        status,
        fileUrl,
      },
    })

    return res.status(201).json({ message: 'Documento criado com sucesso.' })
  })

  req.pipe(bb)
}
