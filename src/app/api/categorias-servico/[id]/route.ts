import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { withLogging } from '@/lib/api-handler'
import { getMasterId } from '@/lib/getMasterId'

export const runtime = 'nodejs'

async function updateCategoria(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token?.id) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const { nome, descricao, ativo } = body

    const masterId = await getMasterId(token.id as string)

    const categoria = await prisma.categoriaServico.findFirst({
      where: {
        id: params.id,
        ownerId: masterId,
      },
    })

    if (!categoria) {
      return NextResponse.json(
        { message: 'Categoria não encontrada' },
        { status: 404 },
      )
    }

    // Se mudou o nome, verificar se já existe
    if (nome && nome.trim() !== categoria.nome) {
      const existente = await prisma.categoriaServico.findFirst({
        where: {
          nome: nome.trim(),
          ownerId: masterId,
          NOT: { id: params.id },
        },
      })

      if (existente) {
        return NextResponse.json(
          { message: 'Já existe uma categoria com este nome' },
          { status: 400 },
        )
      }
    }

    const updated = await prisma.categoriaServico.update({
      where: { id: params.id },
      data: {
        ...(nome && { nome: nome.trim() }),
        ...(descricao !== undefined && { descricao: descricao?.trim() || null }),
        ...(ativo !== undefined && { ativo }),
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar categoria', error: error.message },
      { status: 500 },
    )
  }
}

async function deleteCategoria(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token?.id) {
      return NextResponse.json(
        { message: 'Não autenticado' },
        { status: 401 },
      )
    }

    const masterId = await getMasterId(token.id as string)

    const categoria = await prisma.categoriaServico.findFirst({
      where: {
        id: params.id,
        ownerId: masterId,
      },
    })

    if (!categoria) {
      return NextResponse.json(
        { message: 'Categoria não encontrada' },
        { status: 404 },
      )
    }

    // Verificar se há documentos usando esta categoria
    const documentosCount = await prisma.document.count({
      where: {
        categoriaServicoId: params.id,
      },
    })

    if (documentosCount > 0) {
      // Desativar em vez de deletar
      await prisma.categoriaServico.update({
        where: { id: params.id },
        data: { ativo: false },
      })

      return NextResponse.json({
        message: 'Categoria desativada (possui documentos associados)',
      })
    }

    await prisma.categoriaServico.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Categoria deletada com sucesso' })
  } catch (error: any) {
    console.error('Erro ao deletar categoria:', error)
    return NextResponse.json(
      { message: 'Erro ao deletar categoria', error: error.message },
      { status: 500 },
    )
  }
}

export const PATCH = withLogging(updateCategoria)
export const DELETE = withLogging(deleteCategoria)

