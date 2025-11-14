import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'

export default async function CategoriasLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'master') {
    return redirect('/unauthorized')
  }

  return <>{children}</>
}

