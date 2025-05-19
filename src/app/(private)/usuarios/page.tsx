import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UsuariosContent from '@/components/UsuariosContent'

type PageProps = {
  searchParams?: Record<string, string | string[]>
}

export default async function UsuariosPage({ searchParams = {} }: PageProps) {
  const session = await getServerSession(authOptions)

  if (
    !session ||
    !session.user ||
    !['master', 'admin'].includes(session.user.role)
  ) {
    return redirect('/login')
  }

  const busca = typeof searchParams.busca === 'string' ? searchParams.busca : ''
  const role = typeof searchParams.role === 'string' ? searchParams.role : ''
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : ''

  const isMaster = session.user.role === 'master'
  const userId = session.user.id

  const users = await prisma.user.findMany({
    where: {
      AND: [
        busca
          ? {
              OR: [
                { name: { contains: busca, mode: 'insensitive' } },
                { email: { contains: busca, mode: 'insensitive' } },
              ],
            }
          : {},
        role ? { role } : {},
        status ? { status } : {},
        !isMaster
          ? {
              OR: [
                { id: userId }, // o próprio admin
                { adminId: userId, role: 'consultor' }, // consultores que ele gerencia
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      cpf: true,
      role: true,
      status: true,
      createdAt: true,
    },
  })

  return (
    <UsuariosContent
      users={users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      }))}
      isMaster={isMaster}
    />
  )
}
