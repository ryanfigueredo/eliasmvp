// src/app/(private)/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ReactNode } from 'react'
import { SidebarContent } from '@/components/SidebarContent'
import { Button } from '@/components/ui/button'
import ConfigUsuarioModal from '@/components/ConfigUsuarioModal'
import { LogOut } from 'lucide-react'
import Image from 'next/image'

export default async function PrivateLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) return redirect('/login')

  const user = session.user
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, image: true, role: true },
      })
    : null

  if (!user) return redirect('/login')

  return (
    <div className="min-h-screen flex bg-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between py-6 px-4">
        <div>
          <Image
            src={'/logo.jpeg'}
            alt="Logo"
            width={150}
            height={100}
            className="mb-6"
          />
          {session.user && <SidebarContent role={session.user.role as any} />}
        </div>

        <div className="px-2 mt-6 space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-600">
              {user.name?.charAt(0).toUpperCase() ?? 'U'}
            </div>

            <div className="flex flex-col text-sm text-zinc-700">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-zinc-500">{user.email}</span>
            </div>
          </div>

          {session.user && (
            <ConfigUsuarioModal
              user={{
                id: session.user.id,
                name: user.name,
                email: user.email,
              }}
            />
          )}

          <form action="/api/auth/signout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className="text-red-600 text-xs px-0 justify-start hover:underline flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
