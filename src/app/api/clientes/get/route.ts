import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca') || ''
  const role = req.headers.get('x-user-role') || ''
  const userId = req.headers.get('x-user-id') || ''

  let userIds: string[] = []

  if (role === 'master') {
    userIds = []
  } else if (role === 'admin') {
    const consultores = await prisma.user.findMany({
      where: { role: 'consultor', adminId: userId },
      select: { id: true },
    })
    userIds = [userId, ...consultores.map((c) => c.id)]
  } else if (role === 'consultor') {
    userIds = [userId]
  }

  const clientes = await prisma.cliente.findMany({
    where: {
      AND: [
        busca
          ? {
              OR: [
                { nome: { contains: busca, mode: 'insensitive' } },
                { cpfCnpj: { contains: busca, mode: 'insensitive' } },
              ],
            }
          : {},
        userIds.length > 0 ? { userId: { in: userIds } } : {},
      ],
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clientes)
}
