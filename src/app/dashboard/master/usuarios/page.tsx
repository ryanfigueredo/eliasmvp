import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UsuariosContent from '@/components/UsuariosContent'

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== 'master') {
    return redirect('/login')
  }

  const busca = typeof searchParams.busca === 'string' ? searchParams.busca : ''
  const role = typeof searchParams.role === 'string' ? searchParams.role : ''
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : ''

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
    />
  )
}
