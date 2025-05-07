import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SidebarContent } from '@/components/SidebarContent'
import { ReactNode } from 'react'
import ConfigUsuarioModal from '@/components/ConfigUsuarioModal'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function MasterLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'consultor')
    return redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true },
  })

  if (!user) return redirect('/login')

  return (
    <div className="min-h-screen flex bg-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between py-6 px-4">
        <div>
          <h2 className="text-xl font-bold text-[#9C66FF] mb-6 px-2">
            Painel Master
          </h2>
          <SidebarContent role="consultor" />
        </div>

        {/* Footer */}
        <div className="px-2 mt-6 space-y-1">
          <div className="flex items-center gap-3">
            {user.image ? (
              <img
                src={user.image}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-600">
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            )}
            <div className="flex flex-col text-sm text-zinc-700">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-zinc-500">{user.email}</span>
            </div>
          </div>

          <ConfigUsuarioModal user={session.user} />

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
