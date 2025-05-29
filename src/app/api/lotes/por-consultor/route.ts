import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ message: 'userId inválido' }, { status: 400 })
  }

  try {
    const documentos = await prisma.document.findMany({
      where: { userId },
      select: { loteId: true },
    })

    const loteIds = [
      ...new Set(documentos.map((d) => d.loteId).filter(Boolean)),
    ]

    if (loteIds.length === 0) {
      return NextResponse.json([])
    }

    const lotes = await prisma.lote.findMany({
      where: { id: { in: loteIds as string[] } },
      orderBy: { inicio: 'desc' },
      include: {
        documentos: {
          where: { userId },
          select: { status: true },
        },
      },
    })

    const lotesComStatus = lotes.map((lote) => {
      const statusList = lote.documentos.map((doc) => doc.status)
      const statusSet = new Set(statusList)

      let status = 'Sem documentos'

      if (statusList.length > 0) {
        if (statusSet.has('EM_ANDAMENTO')) {
          status = 'Em andamento'
        } else if (statusSet.has('INICIADO')) {
          status = 'Iniciado'
        } else if (statusSet.has('FINALIZADO') && statusSet.size === 1) {
          status = 'Finalizado'
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
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Erro ao buscar lotes.' },
      { status: 500 },
    )
  }
}
