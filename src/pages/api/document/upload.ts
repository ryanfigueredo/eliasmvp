import { prisma } from '@/lib/prisma'
import { registrarLog } from '@/lib/log'
import { NextApiRequest, NextApiResponse } from 'next'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuid } from 'uuid'
import busboy from 'busboy'

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

  const bb = busboy({ headers: req.headers })
  const chunks: Uint8Array[] = []

  let userId = ''
  let orgao = ''
  let status = ''
  let fileUrl = ''
  let filename = ''

  bb.on('field', (name, val) => {
    if (name === 'userId') userId = val
    if (name === 'orgao') orgao = val
    if (name === 'status') status = val
  })

  bb.on('file', async (name, file, info) => {
    filename = `${Date.now()}-${uuid()}-${info.filename}`
    const uploadFolder = path.join(process.cwd(), 'public', 'uploads')

    // Garante que a pasta uploads exista
    await mkdir(uploadFolder, { recursive: true })

    const uploadPath = path.join(uploadFolder, filename)
    fileUrl = `/uploads/${filename}`

    for await (const chunk of file) {
      chunks.push(chunk)
    }

    await writeFile(uploadPath, Buffer.concat(chunks))
  })

  bb.on('close', async () => {
    if (!userId || !orgao || !status || !fileUrl) {
      return res.status(400).json({ message: 'Campos obrigatórios ausentes.' })
    }

    try {
      await prisma.document.create({
        data: {
          userId,
          orgao,
          status,
          fileUrl,
        },
      })

      await registrarLog(
        userId,
        'Upload de Documento',
        `Arquivo ${filename} enviado para ${orgao} com status ${status}`,
      )

      return res.status(201).json({ message: 'Documento criado com sucesso.' })
    } catch (error) {
      console.error('Erro ao criar documento:', error)
      return res.status(500).json({ message: 'Erro ao criar documento.' })
    }
  })

  req.pipe(bb)
}
