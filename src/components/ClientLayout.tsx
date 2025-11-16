'use client'

import { useEffect, useState } from 'react'
import { SidebarContent } from '@/components/SidebarContent'
import { Button } from '@/components/ui/button'
import { LogOut, Menu, Settings, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { signOut } from 'next-auth/react'

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
    // Apply saved brand colors if present
    try {
      const savedPrimary = localStorage.getItem('brand-primary')
      const savedText = localStorage.getItem('brand-text')
      if (savedPrimary) {
        document.documentElement.style.setProperty(
          '--brand-primary',
          savedPrimary,
        )
      }
      if (savedText) {
        document.documentElement.style.setProperty('--brand-text', savedText)
      }
    } catch {}
  }, [])

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

        // Load colors from backend (inherits from master if applicable)
        try {
          const colorsRes = await fetch(`/api/config/colors?userId=${sessionUser.id}`)
          if (colorsRes.ok) {
            const colors = await colorsRes.json()
            if (colors.primaryColor) {
              document.documentElement.style.setProperty('--brand-primary', colors.primaryColor)
            }
            if (colors.textColor) {
              document.documentElement.style.setProperty('--brand-text', colors.textColor)
            }
            if (colors.sidebarBg) {
              document.documentElement.style.setProperty('--brand-sidebar-bg', colors.sidebarBg)
            }
          }
        } catch (e) {
          console.warn('[SIDEBAR] falha ao carregar cores do backend', e)
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
        className={`h-screen bg-[var(--brand-sidebar-bg)] text-white border-r flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-20 items-center' : 'w-60 items-start'
        }`}
      >
        {/* Topo da sidebar */}
        <div className="flex flex-col gap-6 px-5 py-6">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-zinc-800/50"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <Menu className="w-5 h-5" />
              ) : (
                <X className="w-5 h-5" />
              )}
            </Button>
          </div>

          <div className="flex justify-center py-2">
            {signedLogoUrl ? (
              <Image
                src={signedLogoUrl}
                alt="Logo"
                width={isCollapsed ? 48 : 120}
                height={isCollapsed ? 48 : 120}
                className="rounded-lg shadow-lg object-contain"
              />
            ) : (
              <Image
                src="/logo.jpeg"
                alt="Logo padrão"
                width={isCollapsed ? 48 : 120}
                height={isCollapsed ? 48 : 120}
                className="rounded-lg shadow-lg object-contain"
              />
            )}
          </div>

          <SidebarContent role={user.role as any} collapsed={isCollapsed} />
        </div>

        <div className="px-5 py-6 border-t border-zinc-700/50">
          <div className="flex items-center gap-3 mb-4">
            {signedUrl === null ? (
              <div className="w-12 h-12 flex-shrink-0">
                <div className="rounded-full w-full h-full bg-zinc-700 animate-pulse" />
              </div>
            ) : (
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage
                  src={signedUrl}
                  alt="Avatar"
                  className="object-cover rounded-full"
                />
                <AvatarFallback className="bg-[var(--brand-primary)] text-white text-lg font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-semibold text-white text-sm truncate">
                  {user.name}
                </span>
                <span className="text-xs text-zinc-400 truncate">
                  {user.email}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Link
              href="/perfil"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Configurações</span>}
            </Link>

            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Sair</span>}
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
