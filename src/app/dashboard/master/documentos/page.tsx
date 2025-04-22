import { cookies } from 'next/headers'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import NovoDocumentoModal from '@/components/NovoDocumentoModal'
import SelectStatusDocumento from '@/components/SelectStatusDocumento'
import FiltroDocumentoModal from '@/components/FiltroDocumentoModal'
import { Orgao, DocumentoStatus } from '@prisma/client'
import PreviewDocumentoModal from '@/components/PreviewDocumentoModal'

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })
  if (!user || user.role !== 'master') return redirect('/login')

  const userId = user.id

  const file = Array.isArray(searchParams.file)
    ? searchParams.file[0]
    : searchParams.file ?? ''
  const orgao = Array.isArray(searchParams.orgao)
    ? searchParams.orgao[0]
    : searchParams.orgao ?? ''
  const status = Array.isArray(searchParams.status)
    ? searchParams.status[0]
    : searchParams.status ?? ''

  const documentos = await prisma.document.findMany({
    where: {
      AND: [
        file ? { fileUrl: { contains: file, mode: 'insensitive' } } : {},
        orgao && Object.values(Orgao).includes(orgao as Orgao)
          ? { orgao: orgao as Orgao }
          : {},
        status &&
        Object.values(DocumentoStatus).includes(status as DocumentoStatus)
          ? { status: status as DocumentoStatus }
          : {},
      ],
    },
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

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <NovoDocumentoModal userId={userId} />
        <FiltroDocumentoModal
          defaultFile={file}
          defaultOrgao={orgao}
          defaultStatus={status}
        />
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
                <PreviewDocumentoModal fileUrl={doc.fileUrl} />
              </td>
              <td className="p-4">{doc.orgao}</td>
              <td className="p-4">
                <SelectStatusDocumento id={doc.id} status={doc.status} />
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
