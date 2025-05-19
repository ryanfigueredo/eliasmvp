'use client'

import { useState } from 'react'
import { SidebarContent } from '@/components/SidebarContent'
import { Button } from '@/components/ui/button'
import ConfigUsuarioModal from '@/components/ConfigUsuarioModal'
import { LogOut, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ClientLayoutProps {
  children: React.ReactNode
  sessionUser: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role?: string | null
  }
  user: {
    name: string | null
    email: string | null
    image: string | null
    role: string
  }
}

export function ClientLayout({
  children,
  sessionUser,
  user,
}: ClientLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen flex bg-zinc-100">
      {/* Sidebar */}
      <aside
        className={`h-screen bg-[#242424] text-white border-r flex flex-col justify-between  transition-all duration-300 ${
          isCollapsed ? 'w-20 items-center' : 'w-64 items-start'
        }`}
      >
        {/* Topo da sidebar */}
        <div className="flex flex-col gap-6 px-4 py-6">
          {/* Botão toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white self-end mb-2"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5 " />
            )}
          </Button>

          {/* Logomarca */}
          <div className="flex justify-center">
            <Image
              src="/logo.jpeg"
              alt="Logo"
              width={isCollapsed ? 40 : 100}
              height={isCollapsed ? 40 : 100}
              className="rounded"
            />
          </div>

          {/* Links da sidebar */}
          <SidebarContent role={user.role as any} collapsed={isCollapsed} />
        </div>

        {/* Rodapé */}
        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-3">
            {isCollapsed ? (
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold">
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div className="flex flex-col text-sm text-white">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-zinc-400">{user.email}</span>
                </div>
              </>
            )}
          </div>

          {!isCollapsed && (
            <ConfigUsuarioModal
              user={{
                id: sessionUser.id,
                name: user.name,
                email: user.email,
              }}
            />
          )}

          <form action="/api/auth/signout" method="POST" className="mt-2">
            <Button
              type="submit"
              variant="ghost"
              className="text-red-500 text-xs px-0 justify-start hover:underline flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && 'Sair'}
            </Button>
          </form>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
