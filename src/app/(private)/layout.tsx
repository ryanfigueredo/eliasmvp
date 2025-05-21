import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ClientLayout } from '@/components/ClientLayout'

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) return redirect('/login')

  // Busca dados atualizados direto do banco
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, image: true, role: true },
  })

  if (!user) return redirect('/login')

  // ✅ Debug: mostra se a imagem está vindo corretamente
  console.log('[layout.tsx] USER IMAGE:', user.image)

  // Força o uso dos dados mais atualizados (inclusive imagem)
  const sessionUser = {
    id: session.user.id,
    email: user.email,
    name: user.name,
    image: user.image, // 🔥 Aqui está o segredo
    role: user.role,
  }

  return (
    <ClientLayout sessionUser={sessionUser} user={user}>
      {children}
    </ClientLayout>
  )
}
