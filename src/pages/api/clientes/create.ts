import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import { readFile, writeFile } from 'fs/promises'
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
    if (err) {
      console.error('Erro ao fazer parse do formulário:', err)
      return res.status(500).json({ message: 'Erro ao processar formulário.' })
    }

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

      // Função para salvar o arquivo no servidor
      const salvarDocumento = async (
        file: any,
        tipo: string,
        clienteId: string,
      ) => {
        const filename = `${Date.now()}-${file.originalFilename}`
        const uploadPath = path.join(process.cwd(), 'public/uploads', filename)

        const data = await readFile(file.filepath)
        await writeFile(uploadPath, data)

        return {
          clienteId,
          tipo,
          fileUrl: `/uploads/${filename}`,
        }
      }

      // Verificar e salvar documentos, se existirem
      if (files.rg) {
        const documentoRG = await salvarDocumento(
          files.rg[0] || files.rg,
          'RG',
          cliente.id,
        )
        documentos.push(documentoRG)
      }

      if (files.cnh) {
        const documentoCNH = await salvarDocumento(
          files.cnh[0] || files.cnh,
          'CNH',
          cliente.id,
        )
        documentos.push(documentoCNH)
      }

      if (files.contrato) {
        const documentoContrato = await salvarDocumento(
          files.contrato[0] || files.contrato,
          'CONTRATO',
          cliente.id,
        )
        documentos.push(documentoContrato)
      }

      // Se houver documentos, salvar no banco
      if (documentos.length > 0) {
        await prisma.documentoCliente.createMany({
          data: documentos,
        })
      }

      return res.status(201).json({ message: 'Cliente criado com sucesso.' })
    } catch (error) {
      console.error('Erro ao salvar cliente e documentos:', error)
      return res
        .status(500)
        .json({ message: 'Erro interno ao salvar cliente.' })
    }
  })
}
