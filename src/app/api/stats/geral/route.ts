import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')
  const role = searchParams.get('role')

  if (!userId || !role) {
    return NextResponse.json(
      { message: 'Parâmetros ausentes' },
      { status: 400 },
    )
  }

  let userIds: string[] | undefined

  if (role === 'consultor') {
    userIds = [userId]
  } else if (role === 'admin') {
    const consultores = await prisma.user.findMany({
      where: { adminId: userId },
      select: { id: true },
    })
    userIds = [userId, ...consultores.map((c) => c.id)]
  }

  const where = userIds ? { userId: { in: userIds } } : {}

  const documentos = await prisma.document.findMany({
    where,
    include: { cliente: true },
  })

  const totalClientes = new Set(documentos.map((doc) => doc.clienteId)).size

  const finalizados = documentos.filter(
    (doc) => doc.status === 'FINALIZADO',
  ).length

  // 🔥 Corrigido: soma única por agrupador
  const documentosUnicos = await prisma.document.findMany({
    where,
    distinct: ['agrupadorId'],
    select: { valor: true },
  })

  const totalValor = documentosUnicos.reduce((acc, doc) => acc + doc.valor, 0)

  return NextResponse.json({
    totalClientes,
    totalDocumentos: documentos.length,
    finalizados,
    totalValor,
  })
}
