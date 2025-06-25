import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { IncomingForm, Fields, Files, File } from 'formidable'
import { readFile } from 'fs/promises'
import { DocumentoStatus, Orgao } from '@prisma/client'
import { Readable } from 'stream'
import { uploadToS3 } from '@/lib/s3'

export const config = {
  api: { bodyParser: false },
}

// Conversão do NextRequest para formato compatível com Formidable
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

    const clienteId = fields.clienteId?.[0]
    const loteId = fields.loteId?.[0]
    const valor = fields.valor?.[0]
    const userId = fields.responsavelId?.[0]

    if (!clienteId || !loteId || !valor || !userId) {
      return NextResponse.json(
        { message: 'Campos obrigatórios ausentes.' },
        { status: 400 },
      )
    }

    const rg = (files.rg as File[] | undefined)?.[0]
    const consulta = (files.consulta as File[] | undefined)?.[0]
    const contrato = (files.contrato as File[] | undefined)?.[0]
    const comprovante = (files.comprovante as File[] | undefined)?.[0]

    const uploads = [
      rg && { tipo: 'RG', file: rg },
      consulta && { tipo: 'CONSULTA', file: consulta },
      contrato && { tipo: 'CONTRATO', file: contrato },
      comprovante && { tipo: 'COMPROVANTE', file: comprovante },
    ].filter(Boolean) as { tipo: string; file: File }[]

    for (const item of uploads) {
      const fileBuffer = await readFile(item.file.filepath)
      const fileUrl = await uploadToS3({
        fileBuffer,
        fileName: `${Date.now()}-${item.tipo.toLowerCase()}-${item.file.originalFilename}`,
        contentType: item.file.mimetype || 'application/pdf',
      })

      await prisma.document.create({
        data: {
          userId,
          clienteId,
          loteId,
          valor: parseFloat(valor),
          tipo: item.tipo,
          orgao: Orgao.SERASA,
          status: DocumentoStatus.INICIADO,
          fileUrl,
        },
      })
    }

    return NextResponse.json(
      { message: 'Documentos enviados com sucesso.' },
      { status: 201 },
    )
  } catch (error) {
    console.error('❌ Erro ao processar upload:', error)
    return NextResponse.json(
      { message: 'Erro ao enviar documentos.' },
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

    // Se for consultor, filtra apenas os documentos dele
    if (role === 'consultor' && userId) {
      where.userId = userId
    }

    // Se for admin, filtra os documentos dos consultores vinculados E os dele mesmo
    if (role === 'admin' && userId) {
      where.OR = [{ userId: userId }, { user: { adminId: userId } }]
    }

    // Se houver filtro por lote
    if (loteId) {
      where.loteId = loteId
    }

    const documentos = await prisma.document.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            admin: { select: { name: true } },
          },
        },
        cliente: {
          select: {
            id: true,
            nome: true,
            user: { select: { name: true } },
          },
        },
        lote: {
          select: {
            id: true,
            nome: true,
            inicio: true,
            fim: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(documentos)
  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar documentos.' },
      { status: 500 },
    )
  }
}
