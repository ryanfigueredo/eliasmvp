import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function PATCH(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token?.id) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })
  }

  const url = new URL(req.url)
  const pathname = url.pathname
  const loteId = pathname.split('/')[3] // corrigido

  const { status } = await req.json()

  if (!loteId || !status) {
    return NextResponse.json({ message: 'Campos inválidos.' }, { status: 400 })
  }

  try {
    const loteExiste = await prisma.lote.findUnique({
      where: { id: loteId },
    })

    if (!loteExiste) {
      return NextResponse.json(
        { message: 'Lote não encontrado.' },
        { status: 404 },
      )
    }

    // Atualiza apenas o status do lote
    const loteAtualizado = await prisma.lote.update({
      where: { id: loteId },
      data: { status },
      select: { id: true, nome: true, status: true }
    })

    console.log('✅ Status do lote atualizado:', loteAtualizado)

    return NextResponse.json({ message: 'Status atualizado com sucesso.' })
  } catch (error) {
    console.error('Erro ao atualizar status do lote:', error)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
