import Link from "next/link"
import { ReactNode } from "react"

export default function MasterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 space-y-4">
        <h2 className="text-xl font-bold text-[#9C66FF]">Painel Master</h2>
        <nav className="space-y-2 text-sm">
          <Link href="/dashboard/master" className="block hover:underline">Dashboard</Link>
          <Link href="/dashboard/master/users" className="block hover:underline">Aprovar Usuários</Link>
        </nav>
        <form action="/api/auth/signout" method="POST">
          <button className="mt-6 text-red-600 text-sm hover:underline">Sair</button>
        </form>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
