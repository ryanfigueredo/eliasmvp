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

  const baseWhere = {
    loteId: { not: null },
    ownerId,
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

  const where = userIds ? { ...baseWhere, userId: { in: userIds } } : baseWhere

  const documentos = await prisma.document.findMany({
    where,
    include: { cliente: true },
  })

  const totalClientes = new Set(documentos.map((doc) => doc.clienteId)).size

  const agrupadoresFinalizados = new Set(
    documentos
      .filter((doc) => doc.status === 'FINALIZADO')
      .map((doc) => doc.agrupadorId ?? doc.id),
  )

  const finalizados = agrupadoresFinalizados.size

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
