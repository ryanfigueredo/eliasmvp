import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.id) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })
  }

  const body = await req.json()
  const { loteId, status } = body
  const statusPermitidos = ['INICIADO', 'EM_ANDAMENTO', 'FINALIZADO']

  if (!loteId || !status || !statusPermitidos.includes(status)) {
    return NextResponse.json({ message: 'Dados inválidos.' }, { status: 400 })
  }

  try {
    // Atualiza o status do próprio lote
    await prisma.lote.update({
      where: { id: loteId },
      data: { status },
    })

    // Atualiza todos os documentos vinculados a esse lote
    await prisma.document.updateMany({
      where: {
        loteId,
      },
      data: {
        status,
      },
    })

    // Log da alteração
    await prisma.log.create({
      data: {
        userId: String(token.id),
        acao: 'ALTERAÇÃO DE STATUS EM LOTE',
        detalhes: `Alterou status do lote ${loteId} e documentos para ${status}`,
      },
    })

    return NextResponse.json(
      { message: 'Status do lote e documentos atualizado.' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return NextResponse.json(
      { message: 'Erro interno ao atualizar status.' },
      { status: 500 },
    )
  }
}
