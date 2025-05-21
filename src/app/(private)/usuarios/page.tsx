import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UsuariosContent from '@/components/UsuariosContent'

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function UsuariosPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)

  if (
    !session ||
    !session.user ||
    !['master', 'admin'].includes(session.user.role)
  ) {
    return redirect('/login')
  }

  // CONVERSÃO CORRETA
  const busca = Array.isArray(searchParams['busca'])
    ? searchParams['busca'][0]
    : searchParams['busca'] || ''

  const role = Array.isArray(searchParams['role'])
    ? searchParams['role'][0]
    : searchParams['role'] || ''

  const status = Array.isArray(searchParams['status'])
    ? searchParams['status'][0]
    : searchParams['status'] || ''

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
              OR: [{ id: userId }, { adminId: userId, role: 'consultor' }],
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
