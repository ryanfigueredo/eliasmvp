import { prisma } from '@/lib/prisma'
import { uploadToS3 } from '@/lib/s3'
import { readFile } from 'fs/promises'
import { IncomingForm } from 'formidable'
import { NextRequest } from 'next/server'

export const config = {
  api: { bodyParser: false },
}

export async function POST(req: NextRequest) {
  const form = new IncomingForm({
    multiples: true,
    keepExtensions: true,
    maxFileSize: 20 * 1024 * 1024, // 20MB
  })

  return new Promise((resolve) => {
    form.parse(req as any, async (err, fields, files) => {
      if (err) {
        console.error('Erro ao processar formulário:', err)
        return resolve(
          new Response(
            JSON.stringify({ message: 'Erro ao processar formulário.' }),
            { status: 500 },
          ),
        )
      }

      const nome = fields.nome?.toString()
      const cpfCnpj = fields.cpfCnpj?.toString()
      const valor = parseFloat(fields.valor?.toString() || '0')
      const responsavelId = fields.responsavelId?.toString()

      if (!nome || !cpfCnpj || !responsavelId) {
        return resolve(
          new Response(
            JSON.stringify({ message: 'Campos obrigatórios ausentes.' }),
            { status: 400 },
          ),
        )
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

        const documentos = []

        const salvarNoS3 = async (file: any, tipo: string) => {
          const fileBuffer = await readFile(file.filepath)
          const fileName = `documentos/${Date.now()}-${file.originalFilename}`
          const fileUrl = await uploadToS3({
            fileBuffer,
            fileName,
            contentType: file.mimetype ?? 'application/octet-stream',
          })

          return {
            clienteId: cliente.id,
            tipo,
            fileUrl,
          }
        }

        if (files.rg)
          documentos.push(await salvarNoS3(files.rg[0] || files.rg, 'RG'))
        if (files.cnh)
          documentos.push(await salvarNoS3(files.cnh[0] || files.cnh, 'CNH'))
        if (files.contrato)
          documentos.push(
            await salvarNoS3(files.contrato[0] || files.contrato, 'CONTRATO'),
          )
        if (files.documentoExtra)
          documentos.push(
            await salvarNoS3(
              files.documentoExtra[0] || files.documentoExtra,
              'EXTRA',
            ),
          )

        if (documentos.length > 0) {
          await prisma.documentoCliente.createMany({ data: documentos })
        }

        return resolve(
          new Response(
            JSON.stringify({ message: 'Cliente criado com sucesso.' }),
            { status: 201 },
          ),
        )
      } catch (error) {
        console.error('Erro ao salvar cliente e documentos:', error)
        return resolve(
          new Response(JSON.stringify({ message: 'Erro ao salvar cliente.' }), {
            status: 500,
          }),
        )
      }
    })
  })
}
