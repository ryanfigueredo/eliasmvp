import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const busca = searchParams.get('busca')?.trim() || ''
  const role = searchParams.get('role')?.trim() || ''
  const status = searchParams.get('status')?.trim() || ''
  const adminId = searchParams.get('adminId')?.trim() || ''

  const filters: any = {}

  if (busca) {
    filters.OR = [
      { name: { contains: busca, mode: 'insensitive' } },
      { email: { contains: busca, mode: 'insensitive' } },
    ]
  }

  if (role) filters.role = role
  if (status) filters.status = status
  if (adminId) filters.adminId = adminId

  try {
    const users = await prisma.user.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        admin: {
          select: { name: true },
        },
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar usuários.' },
      { status: 500 },
    )
  }
}
