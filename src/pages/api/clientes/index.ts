import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'
import { readFile, writeFile } from 'fs/promises'
import { IncomingForm } from 'formidable'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const busca = req.query.busca?.toString() || ''
    const responsavel = req.query.responsavel?.toString() || ''

    const clientes = await prisma.cliente.findMany({
      where: {
        AND: [
          busca
            ? {
                OR: [
                  { nome: { contains: busca, mode: 'insensitive' } },
                  { cpfCnpj: { contains: busca, mode: 'insensitive' } },
                ],
              }
            : {},
          responsavel ? { userId: responsavel } : {},
        ],
      },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(clientes)
  }

  if (req.method === 'POST') {
    const form = new IncomingForm({
      multiples: true,
      uploadDir: '/tmp',
      keepExtensions: true,
    })

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Erro parse:', err)
        return res
          .status(500)
          .json({ message: 'Erro ao processar formulário.' })
      }

      const nome = fields.nome?.toString()
      const cpfCnpj = fields.cpfCnpj?.toString()
      const valor = parseFloat(fields.valor?.toString() || '0')
      const responsavelId = fields.responsavelId?.toString()

      if (!nome || !cpfCnpj || !responsavelId) {
        return res
          .status(400)
          .json({ message: 'Campos obrigatórios ausentes.' })
      }

      try {
        const cliente = await prisma.cliente.create({
          data: { nome, cpfCnpj, valor, userId: responsavelId },
        })

        await prisma.log.create({
          data: {
            userId: responsavelId,
            acao: 'CADASTRO DE CLIENTE',
            detalhes: `Cadastrou o cliente "${nome}" com CPF/CNPJ ${cpfCnpj} no valor de R$${valor}`,
          },
        })

        const salvarDoc = async (file: any, tipo: string) => {
          const filename = `${Date.now()}-${file.originalFilename}`
          const uploadPath = path.join(
            process.cwd(),
            'public/uploads',
            filename,
          )
          const data = await readFile(file.filepath)
          await writeFile(uploadPath, data)
          return {
            clienteId: cliente.id,
            tipo,
            fileUrl: `/uploads/${filename}`,
          }
        }

        const docs = []

        if (files.rg) docs.push(await salvarDoc(files.rg[0] || files.rg, 'RG'))
        if (files.cnh)
          docs.push(await salvarDoc(files.cnh[0] || files.cnh, 'CNH'))
        if (files.contrato)
          docs.push(
            await salvarDoc(files.contrato[0] || files.contrato, 'CONTRATO'),
          )

        if (docs.length > 0)
          await prisma.documentoCliente.createMany({ data: docs })

        return res.status(201).json({ message: 'Cliente criado com sucesso.' })
      } catch (error) {
        console.error(error)
        return res
          .status(500)
          .json({ message: 'Erro interno ao salvar cliente.' })
      }
    })
  } else {
    return res.status(405).end()
  }
}
