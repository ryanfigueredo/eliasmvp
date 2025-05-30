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
    const documento = await prisma.document.update({
      where: { id },
      data: { status },
    })

    await prisma.log.create({
      data: {
        userId: String(token.id),
        acao: 'ALTERAÇÃO DE STATUS',
        detalhes: `Alterou status do documento "${documento.fileUrl}" para ${status}`,
      },
    })

    return NextResponse.json({ message: 'Status atualizado.' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
