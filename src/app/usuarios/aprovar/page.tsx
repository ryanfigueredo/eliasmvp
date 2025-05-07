import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ApproveUserForm from '@/components/ApproveUserForm'

export default async function AprovarUsuariosPage() {
  const session = await getServerSession(authOptions)

  // Permitir apenas MASTER e ADMIN
  if (
    !session ||
    !session.user ||
    !['master', 'admin'].includes(session.user.role)
  ) {
    return redirect('/login')
  }

  const users = await prisma.user.findMany({
    where: { status: 'aguardando' },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuários aguardando aprovação</h1>

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum usuário pendente.
        </p>
      ) : (
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.id} className="p-4 bg-white rounded shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.name || 'Sem nome'}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">CPF: {user.cpf}</p>
                  <p className="text-sm text-gray-400">Cargo: {user.role}</p>
                </div>
                <ApproveUserForm userId={user.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
