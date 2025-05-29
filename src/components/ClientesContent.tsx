'use client'

import { useEffect, useState, useTransition } from 'react'
import NovoClienteModal from '@/components/NovoClienteModal'
import DocumentosClienteModal from '@/components/DocumentosClienteModal'

type Cliente = {
  id: string
  nome: string
  cpfCnpj: string
  valor: number
  createdAt: string
  user?: {
    name: string | null
  }
}

interface ClientesContentProps {
  searchParams: { [key: string]: string | string[] | undefined }
  role: 'master' | 'admin' | 'consultor'
  userId: string
}

export default function ClientesContent({
  searchParams,
  role,
  userId,
}: ClientesContentProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isPending, startTransition] = useTransition()

  const busca =
    typeof searchParams?.busca === 'string' ? searchParams.busca : ''

  useEffect(() => {
    async function fetchClientes() {
      startTransition(async () => {
        try {
          const query = new URLSearchParams()
          if (busca) query.set('busca', busca)

          // 🔒 Consultor só busca seus próprios clientes
          if (role === 'consultor') {
            query.set('responsavel', userId)
          }

          const res = await fetch(`/api/clientes?${query.toString()}`, {
            headers: {
              'x-user-role': role,
              'x-user-id': userId,
            },
          })
          const data = await res.json()
          setClientes(data)
        } catch (error) {
          console.error('Erro ao buscar clientes:', error)
        }
      })
    }

    fetchClientes()
  }, [busca, role, userId])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <NovoClienteModal userId={userId} />
      </div>

      {isPending ? (
        <p className="text-sm text-zinc-500">Carregando clientes...</p>
      ) : (
        <table className="w-full text-sm bg-white border rounded-xl overflow-hidden shadow">
          <thead className="bg-zinc-100 text-left">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">CPF/CNPJ</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Responsável</th>
              <th className="p-4">Criado em</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length > 0 ? (
              clientes.map((cliente) => (
                <tr key={cliente.id} className="border-t">
                  <td className="p-4">{cliente.nome}</td>
                  <td className="p-4">{cliente.cpfCnpj}</td>
                  <td className="p-4">R$ {cliente.valor.toFixed(2)}</td>
                  <td className="p-4">{cliente.user?.name ?? '—'}</td>
                  <td className="p-4">
                    {new Date(cliente.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-right">
                    <DocumentosClienteModal clienteId={cliente.id} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-6 text-zinc-500">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
