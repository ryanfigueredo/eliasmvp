import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NovoDocumentoModal from '@/components/NovoDocumentoModal'

export default async function DocumentosPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) return redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user || user.role !== 'master') return redirect('/login')

  const userId = user.id

  const documentos = await prisma.document.findMany({
    include: {
      user: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  const statusColor = {
    INICIADO: 'bg-yellow-500',
    EM_ANDAMENTO: 'bg-blue-500',
    FINALIZADO: 'bg-green-500',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documentos</h1>

      <div className="mb-4">
        <NovoDocumentoModal userId={userId} />
      </div>

      <table className="w-full bg-white border text-sm rounded-xl overflow-hidden shadow">
        <thead className="bg-zinc-100 text-left">
          <tr>
            <th className="p-4">Arquivo</th>
            <th className="p-4">Órgão</th>
            <th className="p-4">Status</th>
            <th className="p-4">Usuário</th>
            <th className="p-4">Última atualização</th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((doc) => (
            <tr key={doc.id} className="border-t">
              <td className="p-4">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Ver documento
                </a>
              </td>
              <td className="p-4">{doc.orgao}</td>
              <td className="p-4">
                <span
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    statusColor[doc.status]
                  }`}
                />
                {doc.status.replace('_', ' ')}
              </td>
              <td className="p-4">{doc.user?.name ?? '—'}</td>
              <td className="p-4">
                {doc.updatedAt.toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
