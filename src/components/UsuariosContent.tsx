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
  admin?: { name: string | null } // <- aqui
}

export default function UsuariosContent({
  users: initialUsers,
  isMaster,
}: {
  users: Usuario[]
  isMaster: boolean
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

      <div className="max-h-[600px] overflow-y-auto border rounded-xl">
        <table className="w-full border-collapse bg-white text-sm">
          <thead className="sticky top-0 bg-gray-100 shadow z-10">
            <tr className="text-left">
              <th className="p-4">Nome</th>
              <th className="p-4">Email</th>
              <th className="p-4">Situação</th>
              <th className="p-4">Cargo</th>
              <th className="p-4">Criado em</th>
              <th className="p-4">Responsável</th>
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
                  {isMaster ? (
                    <SelectRole id={user.id} role={user.role} />
                  ) : (
                    <span className="text-zinc-600 capitalize">
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4">{user.admin?.name || '—'}</td>

                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <EditarUsuarioModal
                      user={{ ...user, name: user.name || '' }}
                    />
                    {isMaster && (
                      <Button
                        onClick={() => handleDeleteUser(user.id)}
                        variant="ghost"
                        className="text-red-600 text-xs px-0 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ExportarUsuarios
        data={users.map((user) => ({
          ...user,
          createdAt: new Date(user.createdAt),
        }))}
      />
    </div>
  )
}
