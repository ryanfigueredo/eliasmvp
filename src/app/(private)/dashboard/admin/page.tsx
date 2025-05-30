import { getServerSession } from 'next-auth'
import { DefaultSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardStatsGeral from '@/components/DashboardStatsGeral'

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string
      role: string
    } & DefaultSession['user']
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== 'admin') {
    return redirect('/login')
  }

  const adminId = session.user.id

  const [total, aprovados, aguardando, consultores] = await Promise.all([
    prisma.user.count({
      where: {
        OR: [{ id: adminId }, { adminId }],
      },
    }),
    prisma.user.count({
      where: {
        status: 'aprovado',
        OR: [{ id: adminId }, { adminId }],
      },
    }),
    prisma.user.count({
      where: {
        status: 'aguardando',
        adminId,
      },
    }),
    prisma.user.count({
      where: {
        role: 'consultor',
        adminId,
      },
    }),
  ])

  const cardClass = 'bg-white rounded-xl p-6 shadow-sm border'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Visão geral</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cardClass}>
          <p className="text-sm text-gray-500">Total de usuários</p>
          <h2 className="text-2xl font-semibold">{total}</h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-gray-500">Aprovados</p>
          <h2 className="text-2xl font-semibold text-green-600">{aprovados}</h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-gray-500">Aguardando aprovação</p>
          <h2 className="text-2xl font-semibold text-yellow-500">
            {aguardando}
          </h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-gray-500">Consultores</p>
          <h2 className="text-xl font-semibold">{consultores}</h2>
        </div>

        <DashboardStatsGeral userId={session.user.id} role={'admin'} />
      </div>
    </div>
  )
}
