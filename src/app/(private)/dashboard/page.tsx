import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.role) {
    return redirect('/login')
  }

  const role = session.user.role

  switch (role) {
    case 'master':
      return redirect('/dashboard/master')
    case 'admin':
      return redirect('/dashboard/admin')
    case 'consultor':
      return redirect('/dashboard/consultor')
    default:
      return redirect('/login')
  }
}
