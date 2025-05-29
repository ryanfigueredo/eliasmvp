import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const role = req.headers.get('x-user-role')
  const userId = req.headers.get('x-user-id') // mantido para rastreabilidade, mas não usado diretamente aqui

  if (role !== 'master') {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 })
  }

  const body = await req.json()
  const { id } = body

  if (!id) {
    return NextResponse.json({ message: 'ID inválido.' }, { status: 400 })
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { status: 'aprovado' },
    })

    return NextResponse.json({ message: 'Usuário aprovado.' }, { status: 200 })
  } catch (error) {
    console.error('Erro ao aprovar usuário:', error)
    return NextResponse.json({ message: 'Erro interno.' }, { status: 500 })
  }
}
