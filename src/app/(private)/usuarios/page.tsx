import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UsuariosContent from '@/components/UsuariosContent'
import { cookies } from 'next/headers'

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions)

  if (
    !session ||
    !session.user ||
    !['master', 'admin'].includes(session.user.role)
  ) {
    return redirect('/login')
  }

  const cookieStore = await cookies()
  const rawQuery = cookieStore.get('next-url')?.value || ''

  const searchParams = new URLSearchParams(rawQuery)

  const busca = searchParams.get('busca')?.trim() || ''
  const role = searchParams.get('role')?.trim() || ''
  const status = searchParams.get('status')?.trim() || ''
  const adminId = searchParams.get('adminId')?.trim() || ''

  const userId = session.user.id
  const isMaster = session.user.role === 'master'

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ownerId: true, role: true },
  })

  const ownerId = user?.role === 'master' ? userId : user?.ownerId

  if (!ownerId && !isMaster) {
    return redirect('/login')
  }

  // Se for master, mostrar todos os usuários vinculados (qualquer status) + aguardando/aprovados sem ownerId
  // As abas no frontend vão filtrar por status
  const filters: any = isMaster
    ? {
        OR: [
          { ownerId }, // Todos os usuários vinculados a este master (qualquer status)
          { ownerId: null, status: 'aguardando' }, // Usuários aguardando aprovação
          { ownerId: null, status: 'aprovado' }, // Usuários aprovados sem ownerId (caso ainda não tenha sido vinculado)
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

  // Adicionar outros filtros (status será filtrado pelas abas no frontend)
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

  const users = await prisma.user.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      cpf: true,
      role: true,
      status: true,
      whatsapp: true,
      createdAt: true,
      ownerId: true,
      admin: { select: { name: true } },
    },
  })

  const safeUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    admin: user.admin ?? undefined,
  }))

  const admins = await prisma.user.findMany({
    where: {
      role: 'admin',
      ownerId,
    },
    select: {
      id: true,
      name: true,
    },
  })

  const safeAdmins = admins
    .filter((admin) => admin.name)
    .map((admin) => ({
      id: admin.id,
      name: admin.name as string,
    }))

  return (
    <UsuariosContent
      isMaster={isMaster}
      admins={safeAdmins}
      users={safeUsers}
    />
  )
}
