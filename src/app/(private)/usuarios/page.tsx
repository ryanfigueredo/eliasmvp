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

  if (!ownerId) {
    return redirect('/login')
  }

  const filters: any = {
    ownerId,
  }

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
      createdAt: true,
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
