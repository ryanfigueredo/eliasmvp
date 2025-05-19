'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { Home, Users, UserCheck, FileText, ListChecks } from 'lucide-react'

export function SidebarContent({
  role,
  collapsed = false,
}: {
  role: 'master' | 'admin' | 'consultor'
  collapsed?: boolean
}) {
  return (
    <nav className="space-y-2 text-sm">
      <SidebarLink
        href="/dashboard"
        icon={<Home className="w-5 h-5" />}
        collapsed={collapsed}
      >
        Dashboard
      </SidebarLink>

      <SidebarLink
        href="/clientes"
        icon={<UserCheck className="w-5 h-5" />}
        collapsed={collapsed}
      >
        Clientes
      </SidebarLink>

      <SidebarLink
        href="/documentos"
        icon={<FileText className="w-5 h-5" />}
        collapsed={collapsed}
      >
        Documentos
      </SidebarLink>

      {(role === 'master' || role === 'admin') && (
        <SidebarLink
          href="/usuarios"
          icon={<Users className="w-5 h-5" />}
          collapsed={collapsed}
        >
          Usuários
        </SidebarLink>
      )}

      {role === 'master' && (
        <SidebarLink
          href="/logs"
          icon={<ListChecks className="w-5 h-5" />}
          collapsed={collapsed}
        >
          Histórico
        </SidebarLink>
      )}
    </nav>
  )
}

function SidebarLink({
  href,
  children,
  icon,
  collapsed,
}: {
  href: string
  children: ReactNode
  icon: ReactNode
  collapsed: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 text-white hover:text-primary px-2 py-2 rounded transition-colors"
    >
      {icon}
      {!collapsed && children}
    </Link>
  )
}
