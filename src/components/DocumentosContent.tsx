'use client'

import { useEffect, useState, useTransition } from 'react'
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
  const loteId =
    typeof searchParams.loteId === 'string' ? searchParams.loteId : ''

  useEffect(() => {
    startTransition(() => {
      async function fetchDocs() {
        try {
          const query = new URLSearchParams()
          if (file) query.append('file', file)
          if (orgao) query.append('orgao', orgao)
          if (status) query.append('status', status)
          if (loteId) query.append('loteId', loteId)

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
  }, [file, orgao, status, loteId])

  // Agrupa documentos por lote
  type DocumentoComLote = {
    id: string
    orgao: string
    status: string
    fileUrl: string
    updatedAt: string
    user?: { name: string }
    lote?: {
      id: string
      nome: string
      inicio: string
      fim: string
    } | null
  }

  const documentosPorLote = documentos.reduce<
    Record<string, { lote: DocumentoComLote['lote']; docs: DocumentoComLote[] }>
  >((acc, doc) => {
    const loteKey = doc.lote?.id || 'sem-lote'
    if (!acc[loteKey]) {
      acc[loteKey] = { lote: doc.lote ?? null, docs: [] }
    }
    acc[loteKey].docs.push(doc)
    return acc
  }, {})

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

      <div className="space-y-8">
        {Object.entries(documentosPorLote).map(
          ([loteId, grupo]: [string, { lote: any; docs: any[] }]) => (
            <div key={loteId}>
              {/* Cabeçalho do Lote */}
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-zinc-700">
                  {grupo.lote?.nome || 'Documentos sem lote'}
                </h2>
                {grupo.lote && (
                  <p className="text-sm text-zinc-500">
                    {new Date(grupo.lote.inicio).toLocaleDateString('pt-BR')}{' '}
                    até {new Date(grupo.lote.fim).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>

              {/* Tabela */}
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
                  {grupo.docs.map((doc) => (
                    <tr key={doc.id} className="border-t">
                      <td className="p-4">
                        <PreviewDocumentoModal fileUrl={doc.fileUrl} />
                      </td>
                      <td className="p-4">{doc.orgao}</td>
                      <td className="p-4">
                        {role === 'master' || role === 'admin' ? (
                          <SelectStatusDocumento
                            id={doc.id}
                            status={doc.status}
                          />
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
          ),
        )}
      </div>
    </div>
  )
}
