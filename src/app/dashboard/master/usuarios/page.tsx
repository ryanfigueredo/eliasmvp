'use client'

import { useState, useEffect } from 'react'
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
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function UsuariosPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const session = getServerSession(authOptions)
  if (!session || !session.user || session.user.role !== 'master')
    return redirect('/login')

  const [users, setUsers] = useState<any[]>([]) // Estado para armazenar os usuários
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')

  // Função para buscar os usuários
  const fetchUsers = async () => {
    const usersResponse = await prisma.user.findMany({
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

    setUsers(usersResponse)
  }

  // Realiza a consulta ao banco quando os parâmetros de pesquisa mudam
  useEffect(() => {
    fetchUsers()
  }, [search, role, status]) // Reexecuta a consulta ao banco sempre que o filtro mudar

  const handleDeleteUser = async (userId: string) => {
    // Função para excluir o usuário
    const res = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      toast.success('Usuário excluído com sucesso!')
      window.location.reload() // Recarrega a página para atualizar a lista de usuários
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

                {/* Botão de excluir com ícone de lixeira */}
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
