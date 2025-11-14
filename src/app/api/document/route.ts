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
  api: {
    bodyParser: false,
    responseLimit: '100mb',
  },
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
  const form = new IncomingForm({
    multiples: true,
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxFields: 100,
    maxFieldsSize: 100 * 1024 * 1024, // 100MB
  })

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

    // Rota suporta dois modos:
    // 1) JSON com chaves S3 (presigned upload já realizado no client)
    // 2) multipart/form-data com arquivos (fallback)

    const contentType = req.headers.get('content-type') || ''

    // MODO 1: JSON com uploads já no S3
    if (contentType.includes('application/json')) {
      const body = await req.json()
      const {
        clienteId,
        loteId,
        categoriaServicoId,
        valor,
        responsavelId: userId,
        agrupadorId = uuid(),
        uploads,
      } = body || {}

      if (
        !clienteId ||
        !loteId ||
        !valor ||
        !userId ||
        !Array.isArray(uploads) ||
        uploads.length === 0
      ) {
        return NextResponse.json(
          { message: 'Campos obrigatórios ausentes.' },
          { status: 400 },
        )
      }

      try {
        await assertLoteAceitaNovosDocs(loteId)
      } catch (e: any) {
        return NextResponse.json(
          { message: e?.message ?? 'Erro ao validar lote.' },
          { status: e?.statusCode ?? 500 },
        )
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, ownerId: true },
      })

      const ownerId =
        currentUser?.role === 'master' ? userId : currentUser?.ownerId
      if (!ownerId) {
        return NextResponse.json(
          { message: 'Usuário sem master vinculado.' },
          { status: 400 },
        )
      }

      for (const item of uploads as Array<{ key: string; tipo: string }>) {
        // Criar documento com ou sem categoriaServicoId dependendo se a coluna existe
        const documentData: any = {
          userId,
          clienteId,
          loteId,
          valor: parseFloat(String(valor)),
          tipo: item.tipo,
          orgao: Orgao.SERASA,
          status: DocumentoStatus.INICIADO,
          fileUrl: item.key,
          ownerId,
          agrupadorId,
        }

        // Só adiciona categoriaServicoId se existir no schema
        if (categoriaServicoId) {
          documentData.categoriaServicoId = categoriaServicoId
        }

        await prisma.document.create({
          data: documentData,
        })
      }

      return NextResponse.json(
        { message: 'Documentos enviados com sucesso.' },
        { status: 201 },
      )
    }

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
    const categoriaServicoId = fields.categoriaServicoId?.[0]
    const valor = fields.valor?.[0]
    const userId = fields.responsavelId?.[0]

    console.log('🔍 Dados extraídos:', { clienteId, loteId, categoriaServicoId, valor, userId })

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

    // Processar documentos adicionais
    const documentosAdicionais: Array<{ tipo: string; file: File }> = []
    for (let i = 1; i <= 6; i++) {
      const file = (files[`adicional_${i}`] as File[] | undefined)?.[0]
      if (file) {
        documentosAdicionais.push({
          tipo: `ADICIONAL_${i}`,
          file,
        })
      }
    }

    console.log('📄 Arquivos processados:', {
      rg: !!rg,
      consulta: !!consulta,
      contrato: !!contrato,
      comprovante: !!comprovante,
      adicionais: documentosAdicionais.length,
    })

    const uploads = [
      rg && { tipo: 'RG', file: rg },
      consulta && { tipo: 'CONSULTA', file: consulta },
      contrato && { tipo: 'CONTRATO', file: contrato },
      comprovante && { tipo: 'COMPROVANTE', file: comprovante },
      ...documentosAdicionais,
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

        // Criar documento com ou sem categoriaServicoId dependendo se a coluna existe
        const documentData: any = {
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
        }

        // Só adiciona categoriaServicoId se existir no schema
        if (categoriaServicoId) {
          documentData.categoriaServicoId = categoriaServicoId
        }

        try {
          await prisma.document.create({
            data: documentData,
          })
        } catch (createError: any) {
          // Se a coluna não existir, tentar criar sem ela
          if (
            createError?.code === 'P2022' ||
            createError?.message?.includes('categoriaServicoId')
          ) {
            console.log(
              '⚠️ Coluna categoriaServicoId não existe, criando sem ela...',
            )
            delete documentData.categoriaServicoId
            await prisma.document.create({
              data: documentData,
            })
          } else {
            throw createError
          }
        }

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
    console.error(
      '💥 Stack trace:',
      error instanceof Error ? error.stack : 'No stack trace',
    )
    return NextResponse.json(
      {
        message: 'Erro ao enviar documentos.',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
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

    // Tentar buscar com categoriaServico primeiro, se falhar, buscar sem ela
    let documentos
    try {
      documentos = await prisma.document.findMany({
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
              limite: true,
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
          categoriaServico: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      })
    } catch (error: any) {
      // Se a coluna categoriaServicoId não existir, buscar sem ela
      if (
        error?.code === 'P2022' ||
        error?.code === 'P2021' ||
        error?.message?.includes('categoriaServicoId') ||
        error?.message?.includes('CategoriaServico') ||
        error?.message?.includes('categoriaServico')
      ) {
        console.log(
          '⚠️ Coluna categoriaServicoId não existe, buscando sem ela...',
        )
        try {
          documentos = await prisma.document.findMany({
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
                  limite: true,
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
        } catch (fallbackError: any) {
          console.error('Erro no fallback:', fallbackError)
          throw fallbackError
        }
      } else {
        throw error
      }
    }

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
