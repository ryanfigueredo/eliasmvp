import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DocumentosPieConsultor from '@/components/DocumentosPieConsultor'
import DashboardStatsGeral from '@/components/DashboardStatsGeral'

export default async function ConsultorDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'consultor') {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Minha Visão Geral</h1>
      <DashboardStatsGeral userId={session.user.id} role={'consultor'} />
      <DocumentosPieConsultor userId={session.user.id} />
    </div>
  )
}
