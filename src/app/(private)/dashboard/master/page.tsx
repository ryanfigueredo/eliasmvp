import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardStatsGeral from '@/components/DashboardStatsGeral'
import DocumentosPie from '@/components/DocumentosPie'

export default async function MasterDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== 'master') {
    return redirect('/login')
  }

  // Busca user e define ownerId corretamente
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, ownerId: true },
  })

  if (!user) return redirect('/login')

  const ownerId = user.role === 'master' ? user.id : user.ownerId

  if (!ownerId) return redirect('/login')

  // Agora pode usar o ownerId com segurança
  const [total, aprovados, aguardando, consultores, admins] = await Promise.all(
    [
      prisma.user.count({ where: { ownerId } }),
      prisma.user.count({ where: { ownerId, status: 'aprovado' } }),
      prisma.user.count({ where: { ownerId, status: 'aguardando' } }),
      prisma.user.count({ where: { ownerId, role: 'consultor' } }),
      prisma.user.count({ where: { ownerId, role: 'admin' } }),
    ],
  )

  const cardClass = 'bg-white rounded-xl p-6 shadow-sm border'

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-4 pb-6">
      <h1 className="text-2xl font-bold">Visão geral</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className={cardClass}>
          <p className="text-sm text-gray-500">Consultores</p>
          <h2 className="text-xl font-semibold">{consultores}</h2>
        </div>
        <div className={cardClass}>
          <p className="text-sm text-gray-500">Admins</p>
          <h2 className="text-xl font-semibold">{admins}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={cardClass}>
          <DashboardStatsGeral userId={session.user.id} role="master" />
        </div>
        <div className={cardClass}>
          <DocumentosPie userId={session.user.id} role="master" />
        </div>
      </div>
    </div>
  )
}
