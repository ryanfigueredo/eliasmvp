import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UsuariosContent from '@/components/UsuariosContent'
import { headers } from 'next/headers'

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions)

  if (
    !session ||
    !session.user ||
    !['master', 'admin'].includes(session.user.role)
  ) {
    return redirect('/login')
  }

  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const searchParams = new URL(url, `${protocol}://${host}`).searchParams

  const busca = searchParams.get('busca')?.trim() || ''
  const role = searchParams.get('role')?.trim() || ''
  const status = searchParams.get('status')?.trim() || ''
  const adminId = searchParams.get('adminId')?.trim() || ''

  const isMaster = session.user.role === 'master'
  const userId = session.user.id

  // Montagem dinâmica dos filtros
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

  // Se não for master, restringe à própria conta e seus consultores
  if (!isMaster) {
    filters.OR = [{ id: userId }, { adminId: userId, role: 'consultor' }]
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

  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
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

  return <UsuariosContent isMaster={isMaster} admins={safeAdmins} />
}
