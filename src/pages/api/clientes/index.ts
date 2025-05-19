import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import { DocumentoStatus, Orgao } from '@prisma/client'
import { uploadToS3 } from '@/lib/s3'
import { readFile } from 'fs/promises'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const busca = req.query.busca?.toString() || ''
    const role = req.headers['x-user-role']?.toString()
    const userId = req.headers['x-user-id']?.toString()

    let userIds: string[] = []

    if (role === 'master') {
      // Master vê tudo (não filtra por userId)
      userIds = []
    } else if (role === 'admin') {
      // Admin vê ele mesmo + consultores sob sua responsabilidade
      const consultores = await prisma.user.findMany({
        where: {
          role: 'consultor',
          adminId: userId,
        },
        select: {
          id: true,
        },
      })
      userIds = [userId!, ...consultores.map((c) => c.id)]
    } else if (role === 'consultor') {
      userIds = [userId!]
    }

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
          userIds.length > 0 ? { userId: { in: userIds } } : {}, // master vê todos
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
      maxFileSize: 20 * 1024 * 1024,
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
      const rawValor = fields.valor
        ?.toString()
        ?.replace(/[^\d,.-]/g, '')
        .replace(',', '.')
      const valor = parseFloat(rawValor || '0')
      const responsavelId = fields.responsavelId?.toString()
      const loteId = fields.loteId?.toString()

      if (!nome || !cpfCnpj || !responsavelId || !loteId) {
        return res
          .status(400)
          .json({ message: 'Campos obrigatórios ausentes.' })
      }

      try {
        // 👇 Verifica se já existe cliente com mesmo CPF
        let cliente = await prisma.cliente.findUnique({
          where: { cpfCnpj },
        })

        if (!cliente) {
          cliente = await prisma.cliente.create({
            data: { nome, cpfCnpj, valor, userId: responsavelId },
          })

          await prisma.log.create({
            data: {
              userId: responsavelId,
              acao: 'CADASTRO DE CLIENTE',
              detalhes: `Cadastrou o cliente "${nome}" com CPF/CNPJ ${cpfCnpj} no valor de R$${valor}`,
            },
          })
        }

        const salvarDoc = async (file: any, tipo: string) => {
          const fileBuffer = await readFile(file.filepath)
          const fileName = `documentos/${Date.now()}-${file.originalFilename}`
          const fileUrl = await uploadToS3({
            fileBuffer,
            fileName,
            contentType: file.mimetype ?? 'application/octet-stream',
          })

          return {
            clienteId: cliente!.id,
            tipo,
            fileUrl,
          }
        }

        const docs = []
        let consultaFileUrl = ''

        if (files.rg) docs.push(await salvarDoc(files.rg[0] || files.rg, 'RG'))
        if (files.cnh)
          docs.push(await salvarDoc(files.cnh[0] || files.cnh, 'CNH'))
        if (files.consulta) {
          const consulta = await salvarDoc(
            files.consulta[0] || files.consulta,
            'CONSULTA',
          )
          docs.push(consulta)
          consultaFileUrl = consulta.fileUrl
        }
        if (files.contrato)
          docs.push(
            await salvarDoc(files.contrato[0] || files.contrato, 'CONTRATO'),
          )

        if (docs.length > 0) {
          await prisma.documentoCliente.createMany({ data: docs })

          // também criar na tabela Document para exibir no painel
          for (const doc of docs) {
            await prisma.document.create({
              data: {
                userId: responsavelId,
                clienteId: doc.clienteId,
                fileUrl: doc.fileUrl,
                loteId,
                status: DocumentoStatus.INICIADO,
                orgao: Orgao.SERASA,
              },
            })
          }
        }

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
