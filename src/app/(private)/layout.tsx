import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ClientLayout } from '@/components/ClientLayout'

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) return redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, role: true },
  })

  if (!user) return redirect('/login')

  // Ensure session.user is always defined and matches the expected type
  const sessionUser =
    session?.user && session.user.email
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name ?? null,
          image: session.user.image ?? null,
          role: session.user.role ?? null,
        }
      : {
          id: '',
          email: '',
          name: null,
          image: null,
          role: null,
        }

  return (
    <ClientLayout sessionUser={sessionUser} user={user}>
      {children}
    </ClientLayout>
  )
}
