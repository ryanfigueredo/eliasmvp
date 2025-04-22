import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SelectRole from '@/components/SelectRole'
import SelectStatus from '@/components/SelectStatus'
import NovoUsuarioModal from '@/components/NovoUsuarioModal'
import EditarUsuarioModal from '@/components/EditarUsuarioModal'
import UsuarioFiltroModal from '@/components/UsuarioFiltroModal'
import ExportarUsuarios from '@/components/ExportarUsuarios'

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || session.user.role !== 'master')
    return redirect('/login')

  const search =
    typeof searchParams?.search === 'string' ? searchParams.search : ''

  const role = typeof searchParams?.role === 'string' ? searchParams.role : ''

  const status =
    typeof searchParams?.status === 'string' ? searchParams.status : ''

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        role ? { role } : {},
        status ? { status } : {},
      ],
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      cpf: true,
      role: true,
      status: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Todos os usuários</h1>
        <div className="flex space-x-6 justify-between items-center">
          <UsuarioFiltroModal />
          <NovoUsuarioModal />
        </div>
      </div>

      <table className="w-full border-collapse bg-white rounded-xl shadow-sm text-sm overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-4">Nome</th>
            <th className="p-4">Email</th>
            <th className="p-4">Situação</th>
            <th className="p-4">Cargo</th>
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
                <SelectStatus id={user.id} status={user.status} />
              </td>

              <td className="p-4">
                <SelectRole id={user.id} role={user.role} />
              </td>

              <td className="p-4">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              {/* Colocar aqui filtro de data para DD/MM/AAAA */}
              <td className="p-4 text-right">
                <EditarUsuarioModal user={{ ...user, name: user.name || '' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ExportarUsuarios data={users} />
    </div>
  )
}
