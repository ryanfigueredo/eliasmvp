import { prisma } from '@/lib/prisma'
import { DocumentoStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  const { searchParams } = new URL(req.url)
  const statusFiltro = searchParams.get('status')
  const userIdFiltro = searchParams.get('userId')
  const clienteId = searchParams.get('clienteId')

  let userIds: string[] = []

  if (role === 'master') {
    userIds = []
  } else if (role === 'admin') {
    const consultores = await prisma.user.findMany({
      where: { role: 'consultor', adminId: userId || '' },
      select: { id: true },
    })
    userIds = [userId!, ...consultores.map((c) => c.id)]
  } else if (role === 'consultor') {
    userIds = [userId!]
  }

  try {
    const lotes = await prisma.lote.findMany({
      where: {
        ...(role !== 'master' && {
          OR: [
            {
              documentos: {
                some: {
                  userId: { in: userIds },
                },
              },
            },
            {
              criadoPorId: { in: userIds },
            },
          ],
        }),
        ...(clienteId && {
          documentos: {
            some: { clienteId },
          },
        }),
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
            ...(clienteId && { clienteId }),
          },
          select: { status: true },
        },
      },
    })

    const lotesComStatus = lotes.map((lote) => {
      const statusList = lote.documentos.map((doc) => doc.status)
      const total = statusList.length

      let status: DocumentoStatus | 'SEM_DOCUMENTOS' = 'SEM_DOCUMENTOS'

      if (total > 0) {
        const count: Record<DocumentoStatus, number> = {
          INICIADO: 0,
          EM_ANDAMENTO: 0,
          FINALIZADO: 0,
        }

        for (const s of statusList) {
          if (s in count) {
            count[s as DocumentoStatus] += 1
          }
        }

        if (count.FINALIZADO === total) {
          status = 'FINALIZADO'
        } else if (count.EM_ANDAMENTO > 0) {
          status = 'EM_ANDAMENTO'
        } else if (count.INICIADO > 0) {
          status = 'INICIADO'
        } else {
          status = 'SEM_DOCUMENTOS'
        }
      }

      return {
        id: lote.id,
        nome: lote.nome,
        inicio: lote.inicio,
        fim: lote.fim,
        status,
      }
    })

    return NextResponse.json(lotesComStatus)
  } catch (error) {
    console.error('[lotes/with-status] erro:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar lotes.' },
      { status: 500 },
    )
  }
}
