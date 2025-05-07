import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReactNode } from 'react'

export default async function MasterLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'master')
    return redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  })

  if (!user) return redirect('/login')

  return (
    <div className="min-h-screen flex bg-zinc-100">
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
