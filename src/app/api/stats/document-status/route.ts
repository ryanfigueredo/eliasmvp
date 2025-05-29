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
      whereClause = {
        user: {
          OR: [{ id: userId }, { adminId: userId }],
        },
      }
    }

    const [iniciado, andamento, finalizado] = await Promise.all([
      prisma.document.count({ where: { ...whereClause, status: 'INICIADO' } }),
      prisma.document.count({
        where: { ...whereClause, status: 'EM_ANDAMENTO' },
      }),
      prisma.document.count({
        where: { ...whereClause, status: 'FINALIZADO' },
      }),
    ])

    return NextResponse.json({ iniciado, andamento, finalizado })
  } catch (error) {
    console.error('Erro ao buscar status dos documentos:', error)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
