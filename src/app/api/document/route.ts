import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { IncomingForm, Fields, Files, File } from 'formidable'
import { readFile } from 'fs/promises'
import path from 'path'
import { DocumentoStatus, Orgao } from '@prisma/client'
import { Readable } from 'stream'
import { uploadToS3 } from '@/lib/s3'

export const config = {
  api: { bodyParser: false },
}

// Converte NextRequest para stream compatível com formidable
async function nextRequestToNodeRequest(req: NextRequest) {
  const reader = req.body?.getReader()
  const stream = new Readable({
    async read() {
      if (!reader) return this.push(null)
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        this.push(value)
      }
      this.push(null)
    },
  })

  return Object.assign(stream, {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: '',
  }) as any
}

async function parseForm(req: NextRequest) {
  const nodeReq = await nextRequestToNodeRequest(req)
  const form = new IncomingForm({ multiples: true, keepExtensions: true })

  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(nodeReq, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export async function POST(req: NextRequest) {
  try {
    const { fields, files } = await parseForm(req)

    console.log('📝 Campos recebidos:', fields)
    console.log('📎 Arquivos recebidos:', files)

    const clienteId = fields.clienteId?.[0]
    const valor = fields.valor?.[0]
    const responsavelId = fields.responsavelId?.[0]
    const loteId = fields.loteId?.[0]

    if (!clienteId || !valor || !responsavelId || !loteId) {
      return NextResponse.json(
        { message: 'Campos obrigatórios ausentes.' },
        { status: 400 },
      )
    }

    const rg = (files.rg as File[] | undefined)?.[0]
    const consulta = (files.consulta as File[] | undefined)?.[0]
    const contrato = (files.contrato as File[] | undefined)?.[0]
    const comprovante = (files.comprovante as File[] | undefined)?.[0]

    if (!rg || !contrato) {
      return NextResponse.json(
        { message: 'RG e Contrato são obrigatórios.' },
        { status: 400 },
      )
    }

    const rgUrl = await uploadToS3({
      fileBuffer: await readFile(rg.filepath),
      fileName: `${Date.now()}-rg-${rg.originalFilename}`,
      contentType: rg.mimetype || 'application/pdf',
    })

    const consultaUrl = consulta
      ? await uploadToS3({
          fileBuffer: await readFile(consulta.filepath),
          fileName: `${Date.now()}-consulta-${consulta.originalFilename}`,
          contentType: consulta.mimetype || 'application/pdf',
        })
      : null

    const contratoUrl = await uploadToS3({
      fileBuffer: await readFile(contrato.filepath),
      fileName: `${Date.now()}-contrato-${contrato.originalFilename}`,
      contentType: contrato.mimetype || 'application/pdf',
    })

    const comprovanteUrl = comprovante
      ? await uploadToS3({
          fileBuffer: await readFile(comprovante.filepath),
          fileName: `${Date.now()}-comprovante-${comprovante.originalFilename}`,
          contentType: comprovante.mimetype || 'application/pdf',
        })
      : null

    const docsData = [rgUrl, consultaUrl, contratoUrl, comprovanteUrl]
      .filter(Boolean)
      .map((url) => ({
        clienteId,
        userId: responsavelId,
        loteId,
        valor: Number(valor),
        status: DocumentoStatus.INICIADO,
        orgao: Orgao.SERASA,
        fileUrl: url as string,
      }))

    console.log('📦 Dados a serem salvos no banco:', docsData)

    for (const doc of docsData) {
      await prisma.document.create({ data: doc })
    }

    return NextResponse.json(
      { message: 'Documentos enviados com sucesso.' },
      { status: 201 },
    )
  } catch (error) {
    console.error('❌ Erro ao processar upload:', error)
    return NextResponse.json(
      { message: 'Erro interno ao enviar documentos.' },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const loteId = searchParams.get('loteId')
    const role = searchParams.get('role')

    const where: any = {}

    if (role === 'consultor' && userId) {
      where.userId = userId
    }

    if (loteId) {
      where.loteId = loteId
    }

    const documentos = await prisma.document.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            admin: {
              select: { name: true },
            },
          },
        },
        cliente: {
          select: {
            id: true,
            nome: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        lote: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json(documentos)
  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar documentos' },
      { status: 500 },
    )
  }
}
