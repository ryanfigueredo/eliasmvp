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
  const [activeTab, setActiveTab] = useState<'aprovados' | 'aguardando'>('aprovados')
  const loading = false

  // Filtrar usuários por aba
  const aprovados = usersState.filter((u) => u.status === 'aprovado')
  const aguardando = usersState.filter((u) => u.status === 'aguardando')
  const displayedUsers = activeTab === 'aprovados' ? aprovados : aguardando

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
    const displayedIds = displayedUsers.map((u) => u.id)
    if (selectedIds.length === displayedIds.length && displayedIds.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(displayedIds)
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
        
        {/* Abas */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => {
              setActiveTab('aprovados')
              setSelectedIds([])
            }}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'aprovados'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Aprovados ({aprovados.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('aguardando')
              setSelectedIds([])
            }}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'aguardando'
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Aguardando aprovação ({aguardando.length})
          </button>
        </div>

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
                    checked={selectedIds.length === displayedUsers.length && displayedUsers.length > 0}
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
              {displayedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    Nenhum usuário {activeTab === 'aprovados' ? 'aprovado' : 'aguardando aprovação'}
                  </td>
                </tr>
              ) : (
                displayedUsers.map((user) => (
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
                        className="flex items-center gap-1 text-[var(--brand-primary)] hover:underline whitespace-nowrap"
                      >
                        <MessageCircle className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">{user.whatsapp}</span>
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
                      <EditarUsuarioModal
                        user={{ ...user, name: user.name || '', ownerId: user.ownerId || null }}
                        isMaster={isMaster}
                      />
                      {isMaster && (
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
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
