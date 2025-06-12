import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UsuariosContent from '@/components/UsuariosContent'
import { headers } from 'next/headers'

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions)

  if (
    !session ||
    !session.user ||
    !['master', 'admin'].includes(session.user.role)
  ) {
    return redirect('/login')
  }

  // Recupera a URL com os parâmetros da request
  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'

  const searchParams = new URL(url, `${protocol}://${host}`).searchParams

  const busca = searchParams.get('busca') || ''
  const role = searchParams.get('role') || ''
  const status = searchParams.get('status') || ''

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
      admin: {
        select: {
          name: true,
        },
      },
    },
  })

  return (
    <UsuariosContent
      users={users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        admin: user.admin === null ? undefined : user.admin,
      }))}
      isMaster={isMaster}
    />
  )
}
