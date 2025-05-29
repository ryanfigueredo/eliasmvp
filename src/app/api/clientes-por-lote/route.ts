import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const loteId = searchParams.get('loteId')
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id')

  if (!loteId || !role || !userId) {
    return NextResponse.json(
      { message: 'Parâmetros ausentes.' },
      { status: 400 },
    )
  }

  let userIds: string[] = []

  if (role === 'master') {
    userIds = [] // sem filtro
  } else if (role === 'admin') {
    const consultores = await prisma.user.findMany({
      where: { adminId: userId, role: 'consultor' },
      select: { id: true },
    })
    userIds = [userId, ...consultores.map((c) => c.id)]
  } else if (role === 'consultor') {
    userIds = [userId]
  }

  // Buscar clienteId dos documentos do lote
  const documentos = await prisma.document.findMany({
    where: {
      loteId,
      ...(userIds.length > 0 ? { userId: { in: userIds } } : {}),
    },
    select: { clienteId: true },
  })

  const clienteIds = documentos
    .map((doc) => doc.clienteId)
    .filter((id): id is string => Boolean(id)) // remove nulls

  if (clienteIds.length === 0) {
    return NextResponse.json([], { status: 200 })
  }

  const clientes = await prisma.cliente.findMany({
    where: { id: { in: clienteIds } },
    select: {
      id: true,
      nome: true,
      cpfCnpj: true,
      valor: true,
      user: {
        select: {
          name: true,
          admin: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  return NextResponse.json(clientes, { status: 200 })
}
