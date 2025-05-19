// components/app-sidebar.tsx
'use client'

import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarList,
  SidebarSection,
  SidebarTrigger,
} from '@/components/ui/sidebar'

import { Home, Users, FileText, LogOut, Settings } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'

export function AppSidebar() {
  return (
    <Sidebar className="bg-brand-dark text-white border-none">
      <SidebarHeader>
        <div className="flex items-center justify-between px-2">
          <h1 className="text-lg font-bold text-brand-gold">EVAN'S PROC</h1>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <div className="flex-1 px-2 py-4">
        <SidebarSection>
          <SidebarList>
            <SidebarItem icon={<Home className="w-4 h-4" />}>
              <Link href="/dashboard">Dashboard</Link>
            </SidebarItem>
            <SidebarItem icon={<Users className="w-4 h-4" />}>
              <Link href="/clientes">Clientes</Link>
            </SidebarItem>
            <SidebarItem icon={<FileText className="w-4 h-4" />}>
              <Link href="/documentos">Documentos</Link>
            </SidebarItem>
            <SidebarItem icon={<Settings className="w-4 h-4" />}>
              <Link href="/configuracoes">Configurações</Link>
            </SidebarItem>
          </SidebarList>
        </SidebarSection>
        <SidebarFooter className="border-t border-zinc-800 px-4 py-2">
          <form action="/api/auth/signout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className="text-red-500 text-sm flex gap-2 items-center"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </form>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}
