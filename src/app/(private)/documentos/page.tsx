import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DocumentosContent from '@/components/DocumentosContent'

type Props = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function DocumentosPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return redirect('/login')
  }

  return (
    <DocumentosContent
      searchParams={searchParams ?? {}}
      role={session.user.role}
      userId={session.user.id}
    />
  )
}
