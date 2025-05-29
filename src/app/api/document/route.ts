// src/app/api/document/route.ts
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
      ...(loteId ? { loteId: loteId } : {}),
    }

    if (role === 'admin') {
      const consultores = await prisma.user.findMany({
        where: { role: 'consultor', adminId: userId ?? '' },
        select: { id: true },
      })
      const userIds = [userId, ...consultores.map((c) => c.id)].filter(Boolean)
      where.userId = { in: userIds }
    } else if (role === 'consultor') {
      where.userId = userId
    }
    // role master vê tudo (sem filtro de userId)

    const documentos = await prisma.document.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true, // <- quem inputou
            admin: {
              select: { name: true }, // <- responsável
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

    return NextResponse.json(Array.isArray(documentos) ? documentos : [], {
      status: 200,
    })
  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar documentos.' },
      { status: 500 },
    )
  }
}
