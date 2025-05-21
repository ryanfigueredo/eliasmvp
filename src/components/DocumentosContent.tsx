'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import PreviewDocumentoModal from './PreviewDocumentoModal'
import ExcluirDocumentoButton from './ExcluirDocumentoButton'
import NovoDocumentoModal from './NovoDocumentoModal'
import SelectStatusDocumento from './SelectStatusDocumento'
import FiltroDocumentoModal from './FiltroDocumentoModal'
import StatusFarol from './StatusFarol'
import { DocumentoStatus } from '@prisma/client'
import NovoLoteModal from './NovoLoteModal'
import EditarLoteModal from './EditarLoteModal'
import { Button } from './ui/button'

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

  const isConsultor = role === 'consultor'
  const isGestor = role === 'master' || role === 'admin'

  useEffect(() => {
    async function fetchLotes() {
      try {
        const url = isConsultor
          ? `/api/lotes/por-consultor?userId=${userId}`
          : '/api/lotes/with-status'

        const res = await fetch(url, { cache: 'no-store' })
        const data = await res.json()
        setLotesComStatus(data)
      } catch {
        toast.error('Erro ao buscar lotes')
      }
    }
    fetchLotes()
  }, [role, userId])

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
        {!['white-label'].includes(role) && (
          <>
            <NovoDocumentoModal userId={userId} />
            {!isConsultor && <NovoLoteModal />}
          </>
        )}
        <FiltroDocumentoModal
          role={role}
          defaultFile=""
          defaultOrgao=""
          defaultStatus=""
        />
      </div>

      {!loteSelecionado && (
        <table className="w-full text-sm mt-4 bg-white border rounded-xl overflow-hidden shadow">
          <thead className="bg-zinc-100">
            <tr>
              <th className="p-4 text-left">Lote</th>
              <th className="p-4 text-left">Período</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Ação</th>
              {isGestor && <th className="p-4 text-left"></th>}
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
                  <StatusFarol status={lote.status as any} />
                </td>
                <td className="p-4">
                  <Button
                    className="bg-[#9C66FF] hover:bg-[#8450e6] text-white text-sm"
                    onClick={() => setLoteSelecionado(lote.id)}
                  >
                    Ver documentos
                  </Button>
                </td>
                {isGestor && (
                  <td className="p-4">
                    <EditarLoteModal
                      loteId={lote.id}
                      nomeAtual={lote.nome}
                      inicioAtual={lote.inicio}
                      fimAtual={lote.fim}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {loteSelecionado && (
        <>
          <Button
            className="bg-[#9C66FF] hover:bg-[#8450e6] text-white text-sm"
            onClick={() => setLoteSelecionado(null)}
          >
            ← Voltar para lista de lotes
          </Button>

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
                      {isGestor && <th className="p-4 text-right">Ações</th>}
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
                          {isGestor ? (
                            <SelectStatusDocumento
                              id={doc.id}
                              status={doc.status}
                            />
                          ) : (
                            <StatusFarol status={doc.status} />
                          )}
                        </td>
                        <td className="p-4">{doc.user?.name ?? '—'}</td>
                        <td className="p-4">
                          {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                        </td>
                        {isGestor && (
                          <td className="p-4 text-right">
                            <ExcluirDocumentoButton id={doc.id} />
                          </td>
                        )}
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
