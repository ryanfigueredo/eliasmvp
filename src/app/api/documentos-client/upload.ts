import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { v4 as uuid } from 'uuid'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
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
  const uploads: Promise<void>[] = []

  let clienteId = ''

  bb.on('field', (name, val) => {
    if (name === 'clienteId') clienteId = val
  })

  bb.on('file', (name, file, info) => {
    const tipo = name // 'rg', 'consulta', etc.
    const filename = `${Date.now()}-${uuid()}-${info.filename}`
    const uploadFolder = path.join(process.cwd(), 'public', 'uploads')
    const uploadPath = path.join(uploadFolder, filename)
    const fileUrl = `/uploads/${filename}`

    uploads.push(
      (async () => {
        const chunks: Uint8Array[] = []
        for await (const chunk of file) {
          chunks.push(chunk)
        }

        await mkdir(uploadFolder, { recursive: true })
        await writeFile(uploadPath, Buffer.concat(chunks))

        await prisma.documentoCliente.create({
          data: {
            clienteId,
            tipo: tipo.toUpperCase(),
            fileUrl,
          },
        })
      })(),
    )
  })

  bb.on('close', async () => {
    try {
      await Promise.all(uploads)
      return res.status(201).json({ message: 'Documentos do cliente salvos.' })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Erro ao salvar documentos.' })
    }
  })

  req.pipe(bb)
}
