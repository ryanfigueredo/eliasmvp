import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DocumentosContent from '@/components/DocumentosContent'

type Props = {
  params: any // caso use rotas dinâmicas
  searchParams?: Record<string, string | string[]>
}

export default async function DocumentosPage({ searchParams }: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect('/login')

  return (
    <DocumentosContent
      searchParams={searchParams ?? {}}
      role={session.user.role}
      userId={session.user.id}
    />
  )
}
