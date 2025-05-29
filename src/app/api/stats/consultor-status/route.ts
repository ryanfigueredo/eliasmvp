import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ message: 'ID inválido.' }, { status: 400 })
  }

  try {
    const [iniciado, andamento, finalizado] = await Promise.all([
      prisma.document.count({ where: { userId, status: 'INICIADO' } }),
      prisma.document.count({ where: { userId, status: 'EM_ANDAMENTO' } }),
      prisma.document.count({ where: { userId, status: 'FINALIZADO' } }),
    ])

    return NextResponse.json({
      INICIADO: iniciado,
      EM_ANDAMENTO: andamento,
      FINALIZADO: finalizado,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
