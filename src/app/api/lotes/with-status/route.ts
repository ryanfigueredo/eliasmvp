import { prisma } from '@/lib/prisma'
import { DocumentoStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!role || !userId) {
    return NextResponse.json(
      { message: 'Cabeçalhos ausentes' },
      { status: 400 },
    )
  }

  const { searchParams } = new URL(req.url)
  const statusFiltro = searchParams.get('status')
  const userIdFiltro = searchParams.get('userId')
  const adminIdFiltro = searchParams.get('adminId')
  const consultorIdFiltro = searchParams.get('consultorId')

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, ownerId: true },
  })

  const ownerId = currentUser?.role === 'master' ? userId : currentUser?.ownerId

  if (!ownerId) {
    return NextResponse.json(
      { message: 'Usuário sem master vinculado.' },
      { status: 400 },
    )
  }

  let userIds: string[] = []

  if (consultorIdFiltro) {
    userIds = [consultorIdFiltro]
  } else if (adminIdFiltro) {
    const consultores = await prisma.user.findMany({
      where: { adminId: adminIdFiltro },
      select: { id: true },
    })
    userIds = consultores.map((c) => c.id)
  } else if (role === 'admin' && userId) {
    const consultores = await prisma.user.findMany({
      where: { adminId: userId },
      select: { id: true },
    })
    userIds = [userId, ...consultores.map((c) => c.id)]
  } else if (role === 'consultor' && userId) {
    userIds = [userId]
  }

  try {
    const lotes = await prisma.lote.findMany({
      where: {
        ownerId,
        ...(userIds.length > 0
          ? {
              OR: [
                { documentos: { some: { userId: { in: userIds } } } },
                { criadoPorId: { in: userIds } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        documentos: {
          where: {
            ...(statusFiltro &&
              Object.values(DocumentoStatus).includes(
                statusFiltro as DocumentoStatus,
              ) && { status: statusFiltro as DocumentoStatus }),
            ...(userIdFiltro && { userId: userIdFiltro }),
          },
          select: { 
            status: true,
            categoriaServico: {
              select: {
                id: true,
                nome: true,
              }
            }
          },
        },
      },
    })

    const lotesComStatus = lotes.map((lote) => {
      // Extrair categorias únicas dos documentos do lote
      const categoriasUnicas = Array.from(
        new Set(
          lote.documentos
            .filter((doc) => doc.categoriaServico)
            .map((doc) => doc.categoriaServico?.nome)
            .filter(Boolean)
        )
      ) as string[]

      return {
        id: lote.id,
        nome: lote.nome,
        inicio: lote.inicio,
        fim: lote.fim,
        status: lote.status || 'INICIADO',
        categorias: categoriasUnicas,
      }
    })

    return NextResponse.json(lotesComStatus, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('[lotes/with-status] erro:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar lotes.' },
      { status: 500 },
    )
  }
}
