import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardStatsConsultor from '@/components/DashboardStatsConsultor'
import DocumentosPieConsultor from '@/components/DocumentosPieConsultor'

export default async function ConsultorDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'consultor') {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Minha Visão Geral</h1>
      <DashboardStatsConsultor userId={session.user.id} />
      <DocumentosPieConsultor userId={session.user.id} />
    </div>
  )
}
