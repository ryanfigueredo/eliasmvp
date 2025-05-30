import { prisma } from '@/lib/prisma'
import { DocumentoStatus, Orgao } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const file = searchParams.get('file')
  const orgao = searchParams.get('orgao')
  const status = searchParams.get('status')
  const loteId = searchParams.get('loteId')

  const role = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  try {
    let userIds: string[] = []

    if (!userId) {
      return NextResponse.json(
        { message: 'ID do usuário ausente.' },
        { status: 400 },
      )
    }

    if (role === 'admin') {
      const consultores = await prisma.user.findMany({
        where: { role: 'consultor', adminId: userId },
        select: { id: true },
      })

      // Inclui o próprio admin + consultores
      userIds = [userId, ...consultores.map((c) => c.id)]
    } else if (role === 'consultor') {
      userIds = [userId]
    }

    const where: any = {
      ...(file
        ? {
            fileUrl: {
              contains: file,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(orgao && Object.values(Orgao).includes(orgao as Orgao)
        ? { orgao: orgao as Orgao }
        : {}),
      ...(status &&
      Object.values(DocumentoStatus).includes(status as DocumentoStatus)
        ? { status: status as DocumentoStatus }
        : {}),
      ...(loteId ? { loteId } : {}),
      ...(userIds.length > 0 ? { userId: { in: userIds } } : {}),
    }

    const documentos = await prisma.document.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
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
              select: { name: true },
            },
          },
        },
        lote: true,
      },
      orderBy: [{ clienteId: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(documentos, { status: 200 })
  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar documentos.' },
      { status: 500 },
    )
  }
}
