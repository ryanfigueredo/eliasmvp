import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NovoClienteModal from '@/components/NovoClienteModal'
import DocumentosClienteModal from '@/components/DocumentosClienteModal'
import FiltroClienteModal from '@/components/FiltroClienteModal'

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'master')
    return redirect('/login')

  const busca = Array.isArray(searchParams.busca)
    ? searchParams.busca[0]
    : searchParams.busca ?? ''

  const responsavel = Array.isArray(searchParams.responsavel)
    ? searchParams.responsavel[0]
    : searchParams.responsavel ?? ''

  const clientes = await prisma.cliente.findMany({
    where: {
      AND: [
        busca
          ? {
              OR: [
                { nome: { contains: busca, mode: 'insensitive' } },
                { cpfCnpj: { contains: busca, mode: 'insensitive' } },
              ],
            }
          : {},
        typeof responsavel === 'string' ? { userId: responsavel } : {},
      ],
    },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clientes</h1>

      <NovoClienteModal />
      <FiltroClienteModal
        defaultNomeCpf={busca}
        defaultResponsavel={typeof responsavel === 'string' ? responsavel : ''}
      />

      <table className="w-full text-sm bg-white border rounded-xl overflow-hidden shadow">
        <thead className="bg-zinc-100 text-left">
          <tr>
            <th className="p-4">Nome</th>
            <th className="p-4">CPF/CNPJ</th>
            <th className="p-4">Valor</th>
            <th className="p-4">Responsável</th>
            <th className="p-4">Criado em</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((cliente) => (
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
