'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import {
  Home,
  Users,
  UserCheck,
  LogOut,
  FileText,
  ListChecks,
} from 'lucide-react'

export function SidebarContent({
  role,
}: {
  role: 'master' | 'admin' | 'consultor'
}) {
  const base = `/dashboard/${role}`

  return (
    <nav className="space-y-2 text-sm">
      <SidebarLink href="/dashboard" icon={<Home className="w-4 h-4" />}>
        Dashboard
      </SidebarLink>

      <SidebarLink href="/clientes" icon={<UserCheck className="w-4 h-4" />}>
        Clientes
      </SidebarLink>

      <SidebarLink href="/documentos" icon={<FileText className="w-4 h-4" />}>
        Documentos
      </SidebarLink>

      {(role === 'master' || role === 'admin') && (
        <SidebarLink href="/usuarios" icon={<Users className="w-4 h-4" />}>
          Usuários
        </SidebarLink>
      )}

      {role === 'master' && (
        <SidebarLink href="/logs" icon={<ListChecks className="w-4 h-4" />}>
          Histórico de Ações
        </SidebarLink>
      )}
    </nav>
  )
}

function SidebarLink({
  href,
  children,
  icon,
}: {
  href: string
  children: ReactNode
  icon: ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-zinc-700 hover:text-[#9C66FF] px-2 py-2 rounded transition-colors"
    >
      {icon}
      {children}
    </Link>
  )
}
