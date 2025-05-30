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

  const where = userIds ? { userId: { in: userIds } } : {} // master não filtra

  const documentos = await prisma.document.findMany({
    where,
    include: { cliente: true },
  })

  const totalClientes = new Set(documentos.map((doc) => doc.clienteId)).size

  const finalizados = documentos.filter(
    (doc) => doc.status === 'FINALIZADO',
  ).length

  const totalValor = documentos.reduce((acc, doc) => {
    return acc + (doc.cliente?.valor || 0)
  }, 0)

  return NextResponse.json({
    totalClientes,
    totalDocumentos: documentos.length,
    finalizados,
    totalValor,
  })
}
