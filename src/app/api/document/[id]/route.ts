import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function PATCH(
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

    const { id: documentoId } = params
    const body = await req.json()

    if (!documentoId) {
      return NextResponse.json(
        { message: 'ID do documento é obrigatório' },
        { status: 400 },
      )
    }

    // Verificar se o documento existe e se o usuário tem permissão
    const documento = await prisma.document.findUnique({
      where: { id: documentoId },
      select: { userId: true, ownerId: true },
    })

    if (!documento) {
      return NextResponse.json(
        { message: 'Documento não encontrado' },
        { status: 404 },
      )
    }

    // Verificar se o usuário tem permissão (master do owner ou dono do documento)
    const usuario = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { role: true, ownerId: true },
    })

    const isMaster = usuario?.role === 'master'
    const ownerId = isMaster ? token.id : usuario?.ownerId

    if (documento.ownerId !== ownerId) {
      return NextResponse.json(
        { message: 'Sem permissão para editar este documento' },
        { status: 403 },
      )
    }

    // Preparar dados de atualização
    const updateData: any = {}

    // Adicionar categoriaServicoId se fornecido
    if (body.categoriaServicoId !== undefined) {
      updateData.categoriaServicoId = body.categoriaServicoId || null
    }

    // Atualizar o documento
    try {
      const documentoAtualizado = await prisma.document.update({
        where: { id: documentoId },
        data: updateData,
        include: {
          categoriaServico: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      })

      return NextResponse.json(documentoAtualizado)
    } catch (error: any) {
      // Se a coluna categoriaServicoId não existir, retornar erro
      if (
        error?.code === 'P2022' ||
        error?.message?.includes('categoriaServicoId')
      ) {
        console.log(
          '⚠️ Coluna categoriaServicoId não existe, atualizando sem ela...',
        )
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
    console.error('Erro ao atualizar documento:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar documento', error: error.message },
      { status: 500 },
    )
  }
}

