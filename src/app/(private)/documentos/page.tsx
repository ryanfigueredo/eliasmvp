import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DocumentosContent from '@/components/DocumentosContent'

export default async function DocumentosPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return redirect('/login')
  }

  return <DocumentosContent role={session.user.role} userId={session.user.id} />
}
