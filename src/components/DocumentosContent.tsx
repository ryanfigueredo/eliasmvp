'use client'

import { useEffect, useState, useTransition } from 'react'
import { Orgao, DocumentoStatus } from '@prisma/client'
import { toast } from 'sonner'
import PreviewDocumentoModal from './PreviewDocumentoModal'
import ExcluirDocumentoButton from './ExcluirDocumentoButton'
import NovoDocumentoModal from './NovoDocumentoModal'
import SelectStatusDocumento from './SelectStatusDocumento'
import FiltroDocumentoModal from './FiltroDocumentoModal'

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
  role: string
  userId: string
}

export default function DocumentosContent({
  searchParams,
  role,
  userId,
}: Props) {
  const [documentos, setDocumentos] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()

  const file = typeof searchParams.file === 'string' ? searchParams.file : ''
  const orgao = typeof searchParams.orgao === 'string' ? searchParams.orgao : ''
  const status =
    typeof searchParams.status === 'string' ? searchParams.status : ''

  useEffect(() => {
    startTransition(() => {
      async function fetchDocs() {
        try {
          const query = new URLSearchParams()
          if (file) query.append('file', file)
          if (orgao) query.append('orgao', orgao)
          if (status) query.append('status', status)

          const res = await fetch(
            `/api/documentos?role=${role}&userId=${userId}&${query.toString()}`,
          )
          const data = await res.json()
          setDocumentos(data)
        } catch (err) {
          toast.error('Erro ao carregar documentos')
        }
      }
      fetchDocs()
    })
  }, [file, orgao, status])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documentos</h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        {role !== 'white-label' && <NovoDocumentoModal userId={userId} />}
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
            {role === 'master' || role === 'admin' ? (
              <th className="p-4 text-right">Ações</th>
            ) : null}
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
                {role === 'master' || role === 'admin' ? (
                  <SelectStatusDocumento id={doc.id} status={doc.status} />
                ) : (
                  <span>{doc.status}</span>
                )}
              </td>
              <td className="p-4">{doc.user?.name ?? '—'}</td>
              <td className="p-4">
                {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
              </td>
              {role === 'master' || role === 'admin' ? (
                <td className="p-4 text-right">
                  <ExcluirDocumentoButton id={doc.id} />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
