import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query')

  if (!query || query.length < 2) {
    return NextResponse.json([], { status: 200 })
  }

  const clientes = await prisma.cliente.findMany({
    where: {
      nome: { contains: query, mode: 'insensitive' },
    },
    select: {
      id: true,
      nome: true,
    },
    take: 10,
  })

  return NextResponse.json(clientes)
}
