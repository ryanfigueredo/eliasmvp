import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token?.id) {
    return NextResponse.json({ message: 'Não autenticado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { name: true, email: true, image: true },
  })

  if (!user) {
    return NextResponse.json(
      { message: 'Usuário não encontrado' },
      { status: 404 },
    )
  }

  return NextResponse.json(user)
}
