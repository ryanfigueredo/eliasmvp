import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientesContent from '@/components/ClientesContent'

export default async function Page({ searchParams }: any) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return redirect('/login')
  }

  return (
    <ClientesContent
      searchParams={searchParams ?? {}}
      role={session.user.role as 'master' | 'admin' | 'consultor'}
      userId={session.user.id}
    />
  )
}
