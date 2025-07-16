import { getServerSession } from 'next-auth'
import { DefaultSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DashboardStatsGeral from '@/components/DashboardStatsGeral'
import DocumentosPie from '@/components/DocumentosPie'

declare module 'next-auth' {
  interface Session {
    user?: {
      id: string
      role: string
      image?: string
    } & DefaultSession['user']
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== 'admin') {
    return redirect('/login')
  }

  // 🔎 Busca o usuário para descobrir o ownerId (master da árvore)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, ownerId: true },
  })

  if (!user?.ownerId) {
    return redirect('/login')
  }

  const ownerId = user.ownerId
  const adminId = session.user.id

  const [total, aprovados, aguardando, consultores] = await Promise.all([
    prisma.user.count({
      where: {
        ownerId,
        OR: [{ id: adminId }, { adminId }],
      },
    }),
    prisma.user.count({
      where: {
        ownerId,
        status: 'aprovado',
        OR: [{ id: adminId }, { adminId }],
      },
    }),
    prisma.user.count({
      where: {
        ownerId,
        status: 'aguardando',
        adminId,
      },
    }),
    prisma.user.count({
      where: {
        ownerId,
        role: 'consultor',
        adminId,
      },
    }),
  ])

  const cardClass = 'bg-white rounded-xl p-6 shadow-sm border'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Visão geral</h1>

      {/* Grid responsiva automática */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
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

        <div className="col-span-full">
          <DashboardStatsGeral userId={session.user.id} role="admin" />
        </div>

        <div className="col-span-full">
          <DocumentosPie userId={session.user.id} role="admin" />
        </div>
      </div>
    </div>
  )
}
