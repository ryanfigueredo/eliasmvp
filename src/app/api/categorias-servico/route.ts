import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { withLogging } from '@/lib/api-handler'
import { getMasterId } from '@/lib/getMasterId'

export const runtime = 'nodejs'

async function getCategorias(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token?.id) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 },
      )
    }

    const masterId = await getMasterId(token.id as string)

    try {
      const categorias = await prisma.categoriaServico.findMany({
        where: {
          ownerId: masterId,
          ativo: true,
        },
        orderBy: {
          nome: 'asc',
        },
      })

      return NextResponse.json(categorias)
    } catch (error: any) {
      // Se a tabela não existir (P2021), retorna array vazio
      if (error?.code === 'P2021' || error?.message?.includes('CategoriaServico')) {
        console.log('⚠️ Tabela CategoriaServico não existe, retornando array vazio')
        return NextResponse.json([])
      }
      throw error
    }
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar categorias', error: error.message },
      { status: 500 },
    )
  }
}

async function createCategoria(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token?.id) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const { nome, descricao } = body

    if (!nome || nome.trim().length === 0) {
      return NextResponse.json(
        { message: 'Nome é obrigatório' },
        { status: 400 },
      )
    }

    const masterId = await getMasterId(token.id as string)

    try {
      // Verificar se já existe categoria com mesmo nome
      const existente = await prisma.categoriaServico.findFirst({
        where: {
          nome: nome.trim(),
          ownerId: masterId,
        },
      })

      if (existente) {
        return NextResponse.json(
          { message: 'Já existe uma categoria com este nome' },
          { status: 400 },
        )
      }

      const categoria = await prisma.categoriaServico.create({
        data: {
          nome: nome.trim(),
          descricao: descricao?.trim() || null,
          ownerId: masterId,
        },
      })

      return NextResponse.json(categoria, { status: 201 })
    } catch (error: any) {
      // Se a tabela não existir (P2021), retorna erro específico
      if (
        error?.code === 'P2021' ||
        error?.message?.includes('CategoriaServico') ||
        error?.message?.includes('does not exist')
      ) {
        console.log('⚠️ Tabela CategoriaServico não existe')
        return NextResponse.json(
          {
            message:
              'Funcionalidade de categorias ainda não disponível neste ambiente. A migração do banco de dados precisa ser aplicada.',
            code: 'TABLE_NOT_EXISTS',
          },
          { status: 503 },
        )
      }
      throw error
    }
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error)
    
    // Verificar se é erro de tabela não existente no catch externo também
    if (
      error?.code === 'P2021' ||
      error?.message?.includes('CategoriaServico') ||
      error?.message?.includes('does not exist')
    ) {
      return NextResponse.json(
        {
          message:
            'Funcionalidade de categorias ainda não disponível neste ambiente. A migração do banco de dados precisa ser aplicada.',
          code: 'TABLE_NOT_EXISTS',
        },
        { status: 503 },
      )
    }
    
    return NextResponse.json(
      { message: 'Erro ao criar categoria', error: error.message },
      { status: 500 },
    )
  }
}

export const GET = withLogging(getCategorias)
export const POST = withLogging(createCategoria)

