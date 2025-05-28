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
import ClientesPorLoteDialog from './ClientesPorLoteDialog'
import { DownloadIcon } from 'lucide-react'

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
  user?: {
    name: string
    admin?: {
      name: string // <-- responsável
    }
  }
  cliente?: {
    nome: string
    user?: { name: string }
  }
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
  const isGestor = role === 'master'

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
        <>
          <NovoDocumentoModal userId={userId} />
          {role === 'master' && <NovoLoteModal />}
        </>

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
                <td className="p-4 flex gap-2">
                  <Button
                    className="bg-[#9C66FF] hover:bg-[#8450e6] text-white text-sm"
                    onClick={() => setLoteSelecionado(lote.id)}
                  >
                    Ver documentos
                  </Button>

                  {isGestor && (
                    <ClientesPorLoteDialog
                      loteId={lote.id}
                      role={role}
                      userId={userId}
                    />
                  )}
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

          <Button
            variant="outline"
            className="text-sm"
            onClick={async () => {
              try {
                const res = await fetch(
                  `/api/lotes/${loteSelecionado}/clientes/csv`,
                  {
                    headers: {
                      'x-user-role': role,
                      'x-user-id': userId,
                    },
                  },
                )

                if (!res.ok) {
                  throw new Error('Erro ao gerar CSV')
                }

                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `clientes_lote_${loteSelecionado}.csv`
                a.click()
                window.URL.revokeObjectURL(url)
              } catch (err) {
                toast.error('Erro ao gerar CSV dos clientes.')
              }
            }}
          >
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download da lista de clientes
          </Button>

          <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 border rounded-xl">
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
                      <th className="p-4">Responsável</th>
                      <th className="p-4">Última atualização</th>
                      {isGestor && <th className="p-4 text-right">Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.docs.map((doc) => (
                      <tr key={doc.id} className="border-t">
                        <td className="p-4 flex gap-2">
                          <PreviewDocumentoModal fileUrl={doc.fileUrl} />
                          <a
                            href={doc.fileUrl}
                            download
                            className="text-sm text-zinc-600 hover:text-zinc-900"
                          >
                            Baixar
                          </a>
                        </td>

                        <td className="p-4">
                          {isGestor ? (
                            <select
                              className="border rounded px-2 py-1 text-sm"
                              defaultValue={doc.orgao}
                              onChange={async (e) => {
                                const novoOrgao = e.target.value

                                try {
                                  const res = await fetch(
                                    `/api/document/${doc.id}/orgao`,
                                    {
                                      method: 'PUT',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        orgao: novoOrgao,
                                      }),
                                    },
                                  )

                                  if (res.ok) {
                                    toast.success(
                                      'Órgão atualizado com sucesso!',
                                    )
                                  } else {
                                    toast.error('Erro ao atualizar órgão.')
                                  }
                                } catch (err) {
                                  toast.error('Erro ao atualizar órgão.')
                                }
                              }}
                            >
                              <option value="SERASA">SERASA</option>
                              <option value="SPC">SPC</option>
                              <option value="BOA_VISTA">BOA VISTA</option>
                              <option value="CENPROT">CENPROT</option>
                            </select>
                          ) : (
                            doc.orgao
                          )}
                        </td>

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
                        <td className="p-4">{doc.user?.admin?.name ?? '—'}</td>

                        <td className="p-4">
                          {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                        </td>
                        {role === 'master' && (
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
