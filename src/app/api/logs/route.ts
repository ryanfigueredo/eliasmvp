import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  console.log('[🔐 TOKEN LOGS]', token)

  if (!token || token.role !== 'master') {
    return NextResponse.json({ message: 'Acesso negado' }, { status: 403 })
  }

  try {
    const logs = await prisma.log.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Erro ao buscar logs:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar logs' },
      { status: 500 },
    )
  }
}
