'use client'

import { useState } from 'react'
import { Trash2, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SelectRole from '@/components/SelectRole'
import SelectStatus from '@/components/SelectStatus'
import NovoUsuarioModal from '@/components/NovoUsuarioModal'
import EditarUsuarioModal from '@/components/EditarUsuarioModal'
import UsuarioFiltroModal from '@/components/UsuarioFiltroModal'
import ExportarUsuarios from '@/components/ExportarUsuarios'
import ApproveUserForm from '@/components/ApproveUserForm'
import { toast } from 'sonner'

type Usuario = {
  id: string
  name: string | null
  email: string
  cpf: string
  role: string
  status: string
  whatsapp?: string | null
  createdAt: string
  admin?: { name: string | null }
  ownerId?: string | null
}

export default function UsuariosContent({
  isMaster,
  admins,
  users,
}: {
  isMaster: boolean
  admins: { id: string; name: string }[]
  users: Usuario[]
}) {
  const [usersState, setUsers] = useState<Usuario[]>(users)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const loading = false

  const handleDeleteUser = async (userId: string) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      toast.success('Usuário excluído com sucesso!')
      setUsers((prev) => prev.filter((user) => user.id !== userId))
    } else {
      const data = await res.json()
      toast.error(data.message || 'Erro ao excluir o usuário.')
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === usersState.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(usersState.map((u) => u.id))
    }
  }

  const handleDeleteSelected = async () => {
    const confirm = window.confirm(
      `Tem certeza que deseja excluir ${selectedIds.length} usuário(s)?`,
    )
    if (!confirm) return

    const res = await fetch('/api/users/delete-many', {
      method: 'DELETE',
      body: JSON.stringify({ userIds: selectedIds }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      toast.success('Usuários excluídos com sucesso')
      setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)))
      setSelectedIds([])
    } else {
      const data = await res.json()
      toast.error(data.message || 'Erro ao excluir usuários.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Todos os usuários</h1>
        <div className="flex space-x-6 justify-between items-center">
          <UsuarioFiltroModal admins={admins} />
          <div className="gap-4 flex">
            {isMaster && selectedIds.length > 0 && (
              <Button onClick={handleDeleteSelected} variant="destructive">
                Excluir selecionados ({selectedIds.length})
              </Button>
            )}
            <NovoUsuarioModal />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500 mt-4">Carregando usuários...</p>
      ) : (
        <div className="max-h-[600px] overflow-y-auto border rounded-xl">
          <table className="w-full border-collapse bg-white text-sm">
            <thead className="sticky top-0 bg-gray-100 shadow z-10">
              <tr className="text-left">
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === usersState.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4">Nome</th>
                <th className="p-4">Email</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Situação</th>
                <th className="p-4">Cargo</th>
                <th className="p-4">Criado em</th>
                <th className="p-4">Responsável</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usersState.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </td>
                  <td className="p-4">{user.name || '-'}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    {user.whatsapp ? (
                      <a
                        href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[var(--brand-primary)] hover:underline"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {user.whatsapp}
                      </a>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
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
                      {isMaster && user.status === 'aguardando' && (
                        <ApproveUserForm
                          userId={user.id}
                          currentOwnerId={user.ownerId}
                        />
                      )}
                      <EditarUsuarioModal
                        user={{ ...user, name: user.name || '' }}
                      />
                      {isMaster && (
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="ghost"
                          className="text-destructive text-xs px-0 hover:underline flex items-center gap-1"
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
      )}

      <ExportarUsuarios
        data={usersState.map((user) => ({
          ...user,
          createdAt: new Date(user.createdAt),
        }))}
      />
    </div>
  )
}
