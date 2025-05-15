'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import PreviewDocumentoModal from './PreviewDocumentoModal'
import ExcluirDocumentoButton from './ExcluirDocumentoButton'
import NovoDocumentoModal from './NovoDocumentoModal'
import SelectStatusDocumento from './SelectStatusDocumento'
import FiltroDocumentoModal from './FiltroDocumentoModal'
import { DocumentoStatus } from '@prisma/client'

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
  role: string
  userId: string
}

type DocumentoComLote = {
  id: string
  orgao: string
  status: DocumentoStatus
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

export default function DocumentosContent({
  searchParams,
  role,
  userId,
}: Props) {
  const [documentos, setDocumentos] = useState<DocumentoComLote[]>([])
  const [lotesComStatus, setLotesComStatus] = useState<
    { id: string; nome: string; inicio: string; fim: string; status: string }[]
  >([])
  const [loteSelecionado, setLoteSelecionado] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function fetchLotes() {
      try {
        const res = await fetch('/api/lotes/with-status')
        const data = await res.json()
        setLotesComStatus(data)
      } catch {
        toast.error('Erro ao buscar lotes')
      }
    }
    fetchLotes()
  }, [])

  useEffect(() => {
    if (!loteSelecionado) return
    startTransition(() => {
      async function fetchDocs() {
        try {
          const res = await fetch(
            `/api/document?role=${role}&userId=${userId}&loteId=${loteSelecionado}`,
          )
          const data = await res.json()
          setDocumentos(data)
        } catch {
          toast.error('Erro ao carregar documentos')
        }
      }
      fetchDocs()
    })
  }, [loteSelecionado])

  const statusClass = {
    INICIADO: 'bg-yellow-100 text-yellow-800',
    EM_ANDAMENTO: 'bg-blue-100 text-blue-800',
    FINALIZADO: 'bg-green-100 text-green-800',
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
        <FiltroDocumentoModal defaultFile="" defaultOrgao="" defaultStatus="" />
      </div>

      {!loteSelecionado && role === 'master' && (
        <table className="w-full text-sm mt-4 bg-white border rounded-xl overflow-hidden shadow">
          <thead className="bg-zinc-100">
            <tr>
              <th className="p-4 text-left">Lote</th>
              <th className="p-4 text-left">Período</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Ação</th>
            </tr>
          </thead>
          <tbody>
            {lotesComStatus.map((lote) => (
              <tr key={lote.id} className="border-t">
                <td className="p-4 font-semibold">{lote.nome}</td>
                <td className="p-4">
                  {new Date(lote.inicio).toLocaleDateString('pt-BR')} até{' '}
                  {new Date(lote.fim).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      statusClass[lote.status as keyof typeof statusClass] ||
                      'text-zinc-500'
                    }`}
                  >
                    {lote.status === 'SEM_DOCUMENTOS'
                      ? 'Sem documentos'
                      : lote.status.replace('_', ' ').toLowerCase()}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    className="text-[#9C66FF] hover:underline text-sm"
                    onClick={() => setLoteSelecionado(lote.id)}
                  >
                    Ver documentos
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {loteSelecionado && (
        <>
          <button
            className="text-sm text-[#9C66FF] hover:underline mb-2"
            onClick={() => setLoteSelecionado(null)}
          >
            ← Voltar para lista de lotes
          </button>

          <div className="space-y-8">
            {Object.entries(documentosPorLote).map(([loteId, grupo]) => (
              <div key={loteId}>
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
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                statusClass[doc.status]
                              }`}
                            >
                              {doc.status.replace('_', ' ').toLowerCase()}
                            </span>
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
            ))}
          </div>
        </>
      )}
    </div>
  )
}
