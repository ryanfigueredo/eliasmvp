'use client'

import { ReactNode, useEffect, useState } from 'react'
import { SidebarContent } from './SidebarContent'
import { LogOut, Settings } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar'
import Link from 'next/link'

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

  useEffect(() => {
    async function fetchImage() {
      if (user.image) {
        try {
          const res = await fetch(`/api/document/get-url?key=${user.image}`)
          const data = await res.json()
          console.log('[sidebar] signedUrl recebido:', data.url)
          setSignedUrl(data.url)
        } catch (error) {
          console.error('Erro ao buscar imagem de perfil:', error)
        }
      }
    }

    fetchImage()
  }, [user.image])

  return (
    <div className="min-h-screen flex bg-black">
      {/* Sidebar fixa */}
      <aside className="w-64 bg-black text-white border-r border-zinc-800 flex flex-col justify-between py-6 px-4">
        <div>
          <h2 className="text-xl font-bold mb-6 px-2">
            {role === 'master'
              ? 'Painel Master'
              : role === 'admin'
                ? 'Acesso Admin'
                : 'Painel Consultor'}
          </h2>

          <SidebarContent role={role} />
        </div>

        {/* Rodapé do Sidebar */}
        <div className="px-2 mt-6 space-y-4">
          {/* Avatar + Nome/Email */}
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage
                src={signedUrl || ''}
                alt="Avatar"
                onError={() =>
                  console.warn('Erro ao carregar imagem de perfil')
                }
              />
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col text-sm">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-zinc-400">{user.email}</span>
            </div>
          </div>

          {/* Configurações + Sair */}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/perfil"
              className="text-sm flex items-center gap-2 text-zinc-300 hover:text-[#9C66FF]"
            >
              <Settings className="w-4 h-4" />
              Configurações
            </Link>

            <form action="/api/auth/signout" method="POST" className="pt-1">
              <button
                type="submit"
                className="text-red-500 text-sm flex items-center gap-2 pl-2 hover:underline"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-white">{children}</main>
    </div>
  )
}
