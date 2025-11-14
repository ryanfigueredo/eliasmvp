'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { Home, Users, UserCheck, FileText, ListChecks, Tags } from 'lucide-react'

export function SidebarContent({
  role,
  collapsed = false,
}: {
  role: 'master' | 'admin' | 'consultor'
  collapsed?: boolean
}) {
  return (
    <nav className="space-y-1">
      <SidebarLink
        href="/dashboard"
        icon={<Home className="w-5 h-5" />}
        collapsed={collapsed}
      >
        Dashboard
      </SidebarLink>

      <SidebarLink
        href="/documentos"
        icon={<FileText className="w-5 h-5" />}
        collapsed={collapsed}
      >
        Clientes
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

      {role === 'master' && (
        <SidebarLink
          href="/categorias"
          icon={<Tags className="w-5 h-5" />}
          collapsed={collapsed}
        >
          Categorias
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
      className="flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/50 transition-all duration-200 group"
    >
      <span className="flex-shrink-0 group-hover:text-[#9C66FF] transition-colors">
        {icon}
      </span>
      {!collapsed && <span className="flex-1">{children}</span>}
    </Link>
  )
}
