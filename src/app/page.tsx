import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Landing from '@/components/landing/Landing'

export const metadata = {
  title: 'Evan s Proc — Gestão de Documentos (White Label)',
  description:
    'Organize documentos por clientes e lotes, com permissões avançadas e nuvem. Pronto para white label.',
  openGraph: {
    title: 'Evans Proc — Gestão de Documentos (White Label)',
    description:
      'Organize documentos por clientes e lotes, com permissões avançadas e nuvem. Pronto para white label.',
    url: 'https://elias.vercel.app/',
    siteName: 'Evan s Proc',
    images: [
      {
        url: '/logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Evans Proc',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
}

export default async function Home() {
  let session: any = null
  try {
    session = await getServerSession(authOptions)
  } catch (err) {
    console.error('[home] getServerSession error:', err)
  }
  if (session && session.user?.role) {
    const role = session.user.role
    switch (role) {
      case 'master':
        return redirect('/dashboard/master')
      case 'admin':
        return redirect('/dashboard/admin')
      case 'consultor':
        return redirect('/dashboard/consultor')
      default:
        return redirect('/login')
    }
  }
  return <Landing />
}
