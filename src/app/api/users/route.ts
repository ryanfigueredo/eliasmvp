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

  // Se for master, incluir também usuários aguardando (sem ownerId)
  // Mas apenas se não houver filtro de status específico
  const filters: any = isMaster
    ? status
      ? // Se houver filtro de status, aplicar normalmente mas ainda incluir aguardando se necessário
        {
          OR: [
            { ownerId, status }, // Usuários vinculados com o status filtrado
            ...(status === 'aguardando'
              ? [{ ownerId: null, status: 'aguardando' }]
              : []), // Se filtrar por aguardando, incluir os sem ownerId
          ],
        }
      : // Sem filtro de status, mostrar todos (vinculados + aguardando)
        {
          OR: [
            { ownerId }, // Usuários já vinculados a este master
            { ownerId: null, status: 'aguardando' }, // Usuários aguardando aprovação
          ],
        }
    : { ownerId }

  // Adicionar filtros de busca
  if (busca) {
    filters.AND = [
      ...(filters.AND || []),
      {
        OR: [
          { name: { contains: busca, mode: 'insensitive' } },
          { email: { contains: busca, mode: 'insensitive' } },
        ],
      },
    ]
  }

  // Adicionar outros filtros (exceto status que já foi tratado acima)
  if (role) {
    filters.AND = [...(filters.AND || []), { role }]
  }
  if (adminId) {
    filters.AND = [...(filters.AND || []), { adminId }]
  }

  if (!isMaster) {
    filters.AND = [
      ...(filters.AND || []),
      {
        OR: [{ id: userId }, { adminId: userId, role: 'consultor' }],
      },
    ]
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
        ownerId: true,
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
