import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 })
  }

  const userId = session.user.id
  const isMaster = session.user.role === 'master'

  const { searchParams } = new URL(req.url)
  const busca = searchParams.get('busca')?.trim() || ''
  const role = searchParams.get('role')?.trim() || ''
  const status = searchParams.get('status')?.trim() || ''
  const adminId = searchParams.get('adminId')?.trim() || ''

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ownerId: true, role: true },
  })

  const ownerId = user?.role === 'master' ? userId : user?.ownerId

  const filters: any = { ownerId }

  if (busca) {
    filters.OR = [
      { name: { contains: busca, mode: 'insensitive' } },
      { email: { contains: busca, mode: 'insensitive' } },
    ]
  }

  if (role) filters.role = role
  if (status) filters.status = status
  if (adminId) filters.adminId = adminId

  if (!isMaster) {
    filters.AND = [
      {
        OR: [{ id: userId }, { adminId: userId, role: 'consultor' }],
      },
      ...(filters.OR ? [{ OR: filters.OR }] : []),
    ]
    delete filters.OR
  }

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
        admin: { select: { name: true } },
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
