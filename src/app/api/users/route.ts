import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')

  if (!role) {
    return NextResponse.json({ message: 'Role obrigatória.' }, { status: 400 })
  }

  try {
    const users = await prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Erro ao buscar usuários.' },
      { status: 500 },
    )
  }
}
