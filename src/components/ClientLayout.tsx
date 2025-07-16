'use client'

import { useEffect, useState } from 'react'
import { SidebarContent } from '@/components/SidebarContent'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, Settings, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { signOut } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'

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
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  })
  const [imageKey, setImageKey] = useState<string | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  const [logoKey, setLogoKey] = useState<string | null>(null)
  const [signedLogoUrl, setSignedLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const [userRes, logoRes] = await Promise.all([
          fetch('/api/user/me'),
          fetch(`/api/config/logo?userId=${sessionUser.id}`),
        ])

        const userData = await userRes.json()
        const logoData = await logoRes.json()

        setImageKey(userData.image)
        if (logoData.url) {
          setSignedLogoUrl(logoData.url)
        }
      } catch (err) {
        console.error('[SIDEBAR] Erro ao buscar dados:', err)
      }
    }

    loadUser()
  }, [sessionUser.id])

  useEffect(() => {
    async function fetchSignedUrl() {
      if (imageKey && imageKey.startsWith('avatars/')) {
        try {
          const res = await fetch(`/api/document/get-url?key=${imageKey}`)
          const data = await res.json()
          setSignedUrl(data.url)
        } catch (err) {
          console.error('[SIDEBAR] Erro ao gerar signedUrl:', err)
        }
      }
    }

    fetchSignedUrl()
  }, [imageKey])

  return (
    <div className="min-h-screen flex bg-zinc-100">
      {/* Sidebar */}
      <aside
        className={`h-screen bg-[#242424] text-white border-r flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-20 items-center' : 'w-64 items-start'
        }`}
      >
        {/* Topo da sidebar */}
        <div className="flex flex-col gap-6 px-4 py-6">
          <Button
            variant="ghost"
            size="icon"
            className="text-white   mb-2"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
          </Button>

          <div className="flex justify-center">
            {signedLogoUrl ? (
              <Image
                src={signedLogoUrl}
                alt="Logo"
                width={isCollapsed ? 40 : 100}
                height={isCollapsed ? 40 : 100}
                className="rounded"
              />
            ) : (
              <Image
                src="/logo.jpeg"
                alt="Logo padrão"
                width={isCollapsed ? 40 : 100}
                height={isCollapsed ? 40 : 100}
                className="rounded"
              />
            )}
          </div>

          <div>
            {user.role === 'master' && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-xs text-zinc-400 px-0 py-1 w-full text-left"
                  >
                    {!isCollapsed ? 'Personalize sua Logo' : ''}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Editar Logo da Plataforma</DialogTitle>
                  </DialogHeader>

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const formData = new FormData()
                      formData.append('file', file)
                      formData.append('userId', sessionUser.id)

                      fetch('/api/config/logo', {
                        method: 'POST',
                        body: formData,
                      })
                        .then((res) => res.json())
                        .then(async (data) => {
                          if (data.config?.logo) {
                            const logoUrl = await fetch(
                              `/api/config/logo?userId=${sessionUser.id}`,
                            )
                            const { url } = await logoUrl.json()
                            window.location.reload()
                          }
                        })
                        .catch((err) => {
                          console.error('[Upload Logo Error]', err)
                        })
                    }}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <SidebarContent role={user.role as any} collapsed={isCollapsed} />
        </div>

        <div className="px-4 py-6">
          <div className="flex items-center gap-3 mb-3">
            {signedUrl === null ? (
              <div className="w-10 h-10">
                <div className="rounded-full  h-full bg-zinc-700 animate-pulse" />
              </div>
            ) : (
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={signedUrl}
                  alt="Avatar"
                  className="object-cover rounded-full"
                />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            {!isCollapsed && (
              <div className="flex flex-col text-sm text-white">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-zinc-400">{user.email}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <Link
              href="/perfil"
              className="text-sm px-0 py-1 justify-start flex items-center gap-2 text-zinc-300 hover:text-[#9C66FF]"
            >
              <Settings className="w-4 h-4" />
              {!isCollapsed && 'Configurações'}
            </Link>

            <button
              onClick={() => signOut()}
              className="text-sm px-0 py-1 justify-start flex items-center gap-2 text-red-500 hover:underline"
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && 'Sair'}
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 h-screen overflow-y-auto p-8 bg-zinc-100">
        {children}
      </main>
    </div>
  )
}
