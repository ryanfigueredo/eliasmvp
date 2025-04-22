import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import { writeFile } from 'fs/promises'
import { v4 as uuid } from 'uuid'
import { IncomingForm } from 'formidable'

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

  const form = new IncomingForm({
    multiples: true,
    uploadDir: '/tmp',
    keepExtensions: true,
  })

  form.parse(req, async (err, fields, files) => {
    if (err)
      return res.status(500).json({ message: 'Erro ao processar formulário.' })

    const nome = fields.nome?.toString()
    const cpfCnpj = fields.cpfCnpj?.toString()
    const valor = parseFloat(fields.valor?.toString() || '0')
    const responsavelId = fields.responsavelId?.toString()

    if (!nome || !cpfCnpj || !responsavelId) {
      return res.status(400).json({ message: 'Dados obrigatórios ausentes.' })
    }

    try {
      const cliente = await prisma.cliente.create({
        data: {
          nome,
          cpfCnpj,
          valor,
          userId: responsavelId,
        },
      })

      const documentos = []

      const salvarDocumento = async (tipo: string, file?: any) => {
        if (!file) return

        const ext = path.extname(file.originalFilename || '')
        const filename = `${uuid()}-${tipo}${ext}`
        const uploadPath = path.join(process.cwd(), 'public/uploads', filename)

        await writeFile(uploadPath, await file.toBuffer?.())
        documentos.push({
          clienteId: cliente.id,
          tipo,
          fileUrl: `/uploads/${filename}`,
        })
      }

      await salvarDocumento('RG', files.rg?.[0] || files.rg)
      await salvarDocumento('CNH', files.cnh?.[0] || files.cnh)
      await salvarDocumento('CONTRATO', files.contrato?.[0] || files.contrato)

      if (documentos.length > 0) {
        await prisma.documentoCliente.createMany({ data: documentos })
      }

      return res.status(201).json({ message: 'Cliente criado com sucesso.' })
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      return res
        .status(500)
        .json({ message: 'Erro interno ao salvar cliente.' })
    }
  })
}
