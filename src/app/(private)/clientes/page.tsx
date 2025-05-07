import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ClientesContent from '@/components/ClientesContent'

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return redirect('/login')
  }

  return (
    <ClientesContent
      searchParams={searchParams}
      role={session.user.role}
      userId={session.user.id}
    />
  )
}
