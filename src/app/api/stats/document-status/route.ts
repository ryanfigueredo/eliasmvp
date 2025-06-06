import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')
  const userId = searchParams.get('userId')

  if (!role || !userId) {
    return NextResponse.json(
      { message: 'Parâmetros ausentes ou inválidos.' },
      { status: 400 },
    )
  }

  try {
    let whereClause: any = {}

    if (role === 'consultor') {
      whereClause = { userId }
    } else if (role === 'admin') {
      const consultores = await prisma.user.findMany({
        where: { adminId: userId },
        select: { id: true },
      })
      const ids = [userId, ...consultores.map((c) => c.id)]
      whereClause = { userId: { in: ids } }
    }

    const documentos = await prisma.document.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      include: { cliente: true },
    })

    // Agrupar por clienteId + loteId e pegar o status mais recente
    const statusPorGrupo = new Map<string, string>()

    for (const doc of documentos) {
      const grupoKey = `${doc.clienteId}-${doc.loteId}`
      if (!statusPorGrupo.has(grupoKey)) {
        statusPorGrupo.set(grupoKey, doc.status)
      }
    }

    // Contagem por status
    const contagem = {
      iniciado: 0,
      andamento: 0,
      finalizado: 0,
    }

    for (const status of statusPorGrupo.values()) {
      if (status === 'INICIADO') contagem.iniciado++
      if (status === 'EM_ANDAMENTO') contagem.andamento++
      if (status === 'FINALIZADO') contagem.finalizado++
    }

    console.log('[📊 AGRUPADO STATUS]', contagem)

    return NextResponse.json(contagem)
  } catch (error) {
    console.error('Erro ao buscar status dos documentos agrupados:', error)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
