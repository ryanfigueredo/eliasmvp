import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { message: 'ID do usuário inválido.' },
      { status: 400 },
    )
  }

  try {
    const [totalClientes, totalDocumentos, finalizados, clientes] =
      await Promise.all([
        prisma.cliente.count({ where: { userId } }),
        prisma.document.count({ where: { userId } }),
        prisma.document.count({ where: { userId, status: 'FINALIZADO' } }),
        prisma.cliente.findMany({
          where: { userId },
          select: { valor: true },
        }),
      ])

    const totalValor = clientes.reduce((acc, c) => acc + c.valor, 0)

    return NextResponse.json({
      totalClientes,
      totalDocumentos,
      finalizados,
      totalValor,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Erro ao buscar dados.' },
      { status: 500 },
    )
  }
}
