'use client'

import { ReactNode, useEffect, useState } from 'react'
import { SidebarContent } from './SidebarContent'
import { LogOut, Settings, Menu, X } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'

interface SidebarLayoutProps {
  children: ReactNode
  role: 'master' | 'admin' | 'consultor'
  user: {
    name: string | null
    email: string | null
    image: string | null
  }
}

export default function SidebarLayout({
  children,
  role,
  user,
}: SidebarLayoutProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    async function fetchImage() {
      if (user.image) {
        try {
          const res = await fetch(`/api/document/get-url?key=${user.image}`)
          const data = await res.json()
          setSignedUrl(data.url)
        } catch (error) {
          console.error('Erro ao buscar imagem de perfil:', error)
        }
      }
    }

    fetchImage()
  }, [user.image])

  return (
    <div className="h-screen flex bg-black">
      <aside
        className={`bg-black text-white border-r border-zinc-800 flex flex-col justify-between py-6 transition-all duration-300 ${
          isCollapsed ? 'w-20 items-center' : 'w-64 px-4 items-start'
        }`}
      >
        <div className="w-full">
          <div className="flex justify-between items-center w-full px-2 mb-6">
            <Image
              src="/logo.jpeg"
              alt="Logo"
              width={isCollapsed ? 36 : 100}
              height={isCollapsed ? 36 : 100}
              className="rounded"
            />

            {!isCollapsed && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white"
                onClick={() => setIsCollapsed(true)}
              >
                <X className="w-5 h-5" />
              </Button>
            )}

            {isCollapsed && (
              <Button
                size="icon"
                variant="ghost"
                className="text-white"
                onClick={() => setIsCollapsed(false)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>

          <SidebarContent role={role} collapsed={isCollapsed} />
        </div>

        <div
          className={`mt-6 w-full ${
            isCollapsed ? 'items-center' : 'items-start px-2'
          } flex flex-col gap-4`}
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={signedUrl || ''} alt="Avatar" />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>

            {!isCollapsed && (
              <div className="flex flex-col text-sm">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-zinc-400">{user.email}</span>
              </div>
            )}
          </div>

          <div
            className={`space-y-1 flex flex-col ${
              isCollapsed ? 'items-center' : 'items-start w-full'
            }`}
          >
            <Link
              href="/perfil"
              className={`text-sm py-1 flex items-center gap-2 text-zinc-300 hover:text-[#9C66FF] ${
                isCollapsed
                  ? 'justify-center'
                  : 'justify-start w-full text-left'
              }`}
            >
              <Settings className="w-4 h-4" />
              {!isCollapsed && 'Configurações'}
            </Link>

            <button
              onClick={() => signOut()}
              className={`text-sm py-1 flex items-center gap-2 text-red-500 hover:underline ${
                isCollapsed
                  ? 'justify-center'
                  : 'justify-start w-full text-left'
              }`}
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && 'Sair'}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-white">{children}</main>
    </div>
  )
}
