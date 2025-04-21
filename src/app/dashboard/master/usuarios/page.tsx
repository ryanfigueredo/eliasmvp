import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || session.user.role !== 'master')
    return redirect('/login')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Todos os usuários</h1>

      <table className="w-full border-collapse bg-white rounded-xl shadow-sm text-sm overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-4">Nome</th>
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4">Status</th>
            <th className="p-4">Criado em</th>
            <th className="p-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-4">{user.name || '-'}</td>
              <td className="p-4">{user.email}</td>
              <td className="p-4">
                <form action="/api/update-role" method="POST">
                  <input type="hidden" name="id" value={user.id} />
                  <select
                    name="role"
                    defaultValue={user.role}
                    className="border rounded px-2 py-1 text-sm"
                    onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  >
                    <option value="consultor">consultor</option>
                    <option value="admin">admin</option>
                    <option value="white-label">white-label</option>
                    <option value="master" disabled>
                      master
                    </option>
                  </select>
                </form>
              </td>
              <td className="p-4">{user.status}</td>
              <td className="p-4">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-right">
                {/* Ações como editar futuramente */}
                <span className="text-gray-400 italic">[editar]</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
