import { HomeIcon, User, UserIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-md ">Pagina Inicial</h1>
      <Link href="/dashboard/master/usuarios">
        <HomeIcon />
        <span>Usuarios</span>
      </Link>
      <Link href="/dashboard/master/consultor">
        <UserIcon />
        <span>Consultores</span>
      </Link>
      <Link href="/dashboard/master/white-label">
        <UserIcon />
        <span>White-Label</span>
      </Link>
    </div>
  )
}
