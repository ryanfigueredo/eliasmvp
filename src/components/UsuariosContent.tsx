'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SelectRole from '@/components/SelectRole'
import SelectStatus from '@/components/SelectStatus'
import NovoUsuarioModal from '@/components/NovoUsuarioModal'
import EditarUsuarioModal from '@/components/EditarUsuarioModal'
import UsuarioFiltroModal from '@/components/UsuarioFiltroModal'
import ExportarUsuarios from '@/components/ExportarUsuarios'
import { toast } from 'sonner'

type Usuario = {
  id: string
  name: string | null
  email: string
  cpf: string
  role: string
  status: string
  createdAt: string
}

export default function UsuariosContent({
  users: initialUsers,
}: {
  users: Usuario[]
}) {
  const [users, setUsers] = useState<Usuario[]>(initialUsers)

  const handleDeleteUser = async (userId: string) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      toast.success('Usuário excluído com sucesso!')
      setUsers((prev) => prev.filter((user) => user.id !== userId))
    } else {
      toast.error('Erro ao excluir o usuário.')
    }
  }

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
                {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </td>
              <td className="p-4 text-right">
                <EditarUsuarioModal user={{ ...user, name: user.name || '' }} />
                <Button
                  onClick={() => handleDeleteUser(user.id)}
                  variant="ghost"
                  className="text-red-600 text-xs px-0 justify-start hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ExportarUsuarios data={users} />
    </div>
  )
}
