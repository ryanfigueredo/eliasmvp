import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { IncomingForm, Fields, Files, File } from 'formidable'
import { readFile } from 'fs/promises'
import { DocumentoStatus, Orgao } from '@prisma/client'
import { Readable } from 'stream'
import { uploadToS3 } from '@/lib/s3'
import { v4 as uuid } from 'uuid'
import { assertLoteAceitaNovosDocs } from '@/lib/guards/lotes'

export const config = {
  api: { bodyParser: false },
}

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
    console.log('📥 Iniciando processamento de upload...')

    // Verificar variáveis de ambiente do S3
    console.log('🔧 Verificando configurações S3...')
    const s3Config = {
      region: process.env.AWS_REGION,
      accessKey: process.env.AWS_ACCESS_KEY_ID
        ? '✅ Configurado'
        : '❌ Não configurado',
      secretKey: process.env.AWS_SECRET_ACCESS_KEY
        ? '✅ Configurado'
        : '❌ Não configurado',
      bucket: process.env.AWS_S3_BUCKET
        ? '✅ Configurado'
        : '❌ Não configurado',
    }
    console.log('🔧 Configurações S3:', s3Config)

    const { fields, files } = await parseForm(req)

    console.log('📋 Campos recebidos:', Object.keys(fields))
    console.log('📁 Arquivos recebidos:', Object.keys(files))

    const clienteId = fields.clienteId?.[0]
    const loteId = fields.loteId?.[0]
    const valor = fields.valor?.[0]
    const userId = fields.responsavelId?.[0]

    console.log('🔍 Dados extraídos:', { clienteId, loteId, valor, userId })

    if (!clienteId || !loteId || !valor || !userId) {
      console.error('❌ Campos obrigatórios ausentes:', {
        clienteId,
        loteId,
        valor,
        userId,
      })
      return NextResponse.json(
        { message: 'Campos obrigatórios ausentes.' },
        { status: 400 },
      )
    }

    try {
      console.log('🔒 Validando lote...')
      await assertLoteAceitaNovosDocs(loteId)
      console.log('✅ Lote validado com sucesso')
    } catch (e: any) {
      console.error('❌ Erro na validação do lote:', e)
      return NextResponse.json(
        { message: e?.message ?? 'Erro ao validar lote.' },
        { status: e?.statusCode ?? 500 },
      )
    }

    console.log('👤 Buscando usuário atual...')
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, ownerId: true },
    })

    console.log('👤 Usuário encontrado:', currentUser)

    const ownerId =
      currentUser?.role === 'master' ? userId : currentUser?.ownerId

    if (!ownerId) {
      console.error('❌ Usuário sem master vinculado:', { userId, currentUser })
      return NextResponse.json(
        { message: 'Usuário sem master vinculado.' },
        { status: 400 },
      )
    }

    console.log('🏢 Owner ID:', ownerId)

    const rg = (files.rg as File[] | undefined)?.[0]
    const consulta = (files.consulta as File[] | undefined)?.[0]
    const contrato = (files.contrato as File[] | undefined)?.[0]
    const comprovante = (files.comprovante as File[] | undefined)?.[0]

    console.log('📄 Arquivos processados:', {
      rg: !!rg,
      consulta: !!consulta,
      contrato: !!contrato,
      comprovante: !!comprovante,
    })

    const uploads = [
      rg && { tipo: 'RG', file: rg },
      consulta && { tipo: 'CONSULTA', file: consulta },
      contrato && { tipo: 'CONTRATO', file: contrato },
      comprovante && { tipo: 'COMPROVANTE', file: comprovante },
    ].filter(Boolean) as { tipo: string; file: File }[]

    console.log('📤 Arquivos para upload:', uploads.length)

    const agrupadorId = fields.agrupadorId?.[0] || uuid()
    console.log('🆔 Agrupador ID:', agrupadorId)

    for (const item of uploads) {
      try {
        console.log(`📤 Processando ${item.tipo}...`)
        const fileBuffer = await readFile(item.file.filepath)
        console.log(`📏 Tamanho do arquivo ${item.tipo}:`, fileBuffer.length)

        const fileName = `${Date.now()}-${item.tipo.toLowerCase()}-${item.file.originalFilename}`
        console.log(`📝 Nome do arquivo ${item.tipo}:`, fileName)

        const fileUrl = await uploadToS3({
          fileBuffer,
          fileName,
          contentType: item.file.mimetype || 'application/pdf',
        })

        console.log(`☁️ Arquivo ${item.tipo} enviado para S3:`, fileUrl)

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
            ownerId,
            agrupadorId,
          },
        })

        console.log(`✅ Documento ${item.tipo} salvo no banco`)
      } catch (error) {
        console.error(`❌ Erro ao processar ${item.tipo}:`, error)
        throw error
      }
    }

    console.log('🎉 Todos os documentos processados com sucesso!')
    return NextResponse.json(
      { message: 'Documentos enviados com sucesso.' },
      { status: 201 },
    )
  } catch (error) {
    console.error('💥 Erro ao processar upload:', error)
    return NextResponse.json(
      { message: 'Erro ao enviar documentos.' },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const where: any = {}
    const { searchParams } = new URL(req.url)
    const clienteId = searchParams.get('clienteId')
    const userId = searchParams.get('userId')
    const loteId = searchParams.get('loteId')
    const role = searchParams.get('role')
    console.log('Params:', { userId, role, clienteId, loteId })

    const currentUser = await prisma.user.findUnique({
      where: { id: userId || '' },
      select: { role: true, ownerId: true },
    })
    console.log('🧑‍💻 currentUser:', currentUser)

    const ownerId =
      currentUser?.role === 'master' ? userId : currentUser?.ownerId

    if (!ownerId) {
      return NextResponse.json(
        { message: 'Usuário sem owner vinculado.' },
        { status: 400 },
      )
    }

    where.ownerId = ownerId

    if (clienteId) where.clienteId = clienteId
    if (loteId) where.loteId = loteId

    if (role === 'consultor' && userId) {
      where.userId = userId
    }

    if (role === 'admin' && userId) {
      where.OR = [{ userId: userId }, { user: { adminId: userId } }]
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
            cpfCnpj: true,
            valor: true,
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

    console.log(' Documentos retornados:', documentos)
    return NextResponse.json(documentos)
  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar documentos.' },
      { status: 500 },
    )
  }
}
