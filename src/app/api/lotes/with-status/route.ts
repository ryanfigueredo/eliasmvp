import { prisma } from '@/lib/prisma'
import { DocumentoStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  const { searchParams } = new URL(req.url)
  const statusFiltro = searchParams.get('status')
  const userIdFiltro = searchParams.get('userId') // usado para cliente selecionado
  const adminIdFiltro = searchParams.get('adminId')
  const consultorIdFiltro = searchParams.get('consultorId')

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
      where:
        role === 'master' && !adminIdFiltro && !consultorIdFiltro
          ? {}
          : {
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
          select: { status: true },
        },
      },
    })

    // ... (status aggregation permanece igual)
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
            count[s]++
          }
        }

        if (count.FINALIZADO === total) status = 'FINALIZADO'
        else if (count.EM_ANDAMENTO > 0) status = 'EM_ANDAMENTO'
        else if (count.INICIADO > 0) status = 'INICIADO'
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
