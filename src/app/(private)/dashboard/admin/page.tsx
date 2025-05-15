import { getServerSession } from 'next-auth'
import { DefaultSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import DashboardStats from '@/components/DashboardStats'
declare module 'next-auth' {
  interface Session {
    user?: {
      id: string
      role: string
    } & DefaultSession['user']
  }
}

export default async function MasterDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== 'master') {
    return redirect('/login')
  }

  const [total, aprovados, aguardando, consultores, admins, whiteLabels] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'aprovado' } }),
      prisma.user.count({ where: { status: 'aguardando' } }),
      prisma.user.count({ where: { role: 'consultor' } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'white-label' } }),
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

        <div className={cardClass}>
          <p className="text-sm text-gray-500">Admins</p>
          <h2 className="text-xl font-semibold">{admins}</h2>
        </div>

        <div className={cardClass}>
          <p className="text-sm text-gray-500">White Labels</p>
          <h2 className="text-xl font-semibold">{whiteLabels}</h2>
        </div>

        <DashboardStats role={session.user.role} userId={session.user.id} />
      </div>
    </div>
  )
}
