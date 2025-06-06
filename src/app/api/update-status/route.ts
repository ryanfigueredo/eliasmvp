import { prisma } from '@/lib/prisma'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.id) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })
  }

  const body = await req.json()
  const { id, status } = body
  const statusPermitidos = ['INICIADO', 'EM_ANDAMENTO', 'FINALIZADO']

  if (!id || !status || !statusPermitidos.includes(status)) {
    return NextResponse.json({ message: 'Dados inválidos.' }, { status: 400 })
  }

  try {
    // Busca o clienteId e loteId do documento original
    const docOriginal = await prisma.document.findUnique({
      where: { id },
      select: { clienteId: true, loteId: true },
    })

    if (!docOriginal || !docOriginal.clienteId || !docOriginal.loteId) {
      return NextResponse.json(
        { message: 'Documento não encontrado ou incompleto.' },
        { status: 404 },
      )
    }

    // Atualiza todos os documentos do mesmo cliente e lote
    await prisma.document.updateMany({
      where: {
        clienteId: docOriginal.clienteId,
        loteId: docOriginal.loteId,
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
        detalhes: `Alterou status de todos os documentos do cliente ${docOriginal.clienteId} no lote ${docOriginal.loteId} para ${status}`,
      },
    })

    return NextResponse.json(
      { message: 'Status atualizado com sucesso.' },
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
