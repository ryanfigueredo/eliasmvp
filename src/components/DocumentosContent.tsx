'use client'

import { useEffect, useState, useTransition, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { DocumentoStatus } from '@prisma/client'
import { ArrowLeft, Trash } from 'lucide-react'

import NovoDocumentoModal from './NovoDocumentoModal'
import NovoLoteModal from './NovoLoteModal'
import EditarLoteModal from './EditarLoteModal'
import ClientesPorLoteDialog from './ClientesPorLoteDialog'
import DocumentosPorClienteGrouped from './DocumentosPorClienteGrouped'
import SelectStatusLote from './SelectStatusLote'
import ClienteFiltroModal from './ClienteFiltroModal'
import { Button } from './ui/button'

interface Props {
  role: string
  userId: string
}

type DocumentoComLote = {
  id: string
  userId: string
  orgao: string
  status: DocumentoStatus
  fileUrl: string
  updatedAt: string
  user?: {
    name: string
    admin?: { name: string }
  }
  cliente?: {
    id: string
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

export default function DocumentosContent({ role, userId }: Props) {
  const [documentos, setDocumentos] = useState<DocumentoComLote[]>([])
  const [lotesComStatus, setLotesComStatus] = useState<
    { id: string; nome: string; inicio: string; fim: string; status: string }[]
  >([])
  const [loteSelecionado, setLoteSelecionado] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()

  const isConsultor = role === 'consultor'
  const isGestor = role === 'master'

  const fetchDocumentos = useCallback(async () => {
    const url = loteSelecionado
      ? `/api/document?role=${role}&userId=${userId}&loteId=${loteSelecionado}`
      : `/api/document`

    try {
      const res = await fetch(url, {
        headers: {
          'x-user-role': role,
          'x-user-id': userId,
        },
      })

      if (!res.ok) throw new Error('Erro na resposta da API')
      const data = await res.json()
      if (!Array.isArray(data)) throw new Error('Resposta inválida')

      setDocumentos(data)
    } catch (err) {
      console.error('Erro ao buscar documentos:', err)
      toast.error('Erro ao carregar documentos')
    }
  }, [loteSelecionado, role, userId])

  useEffect(() => {
    fetchDocumentos()
  }, [fetchDocumentos])

  const [admins, setAdmins] = useState<{ id: string; name: string }[]>([])
  const [consultores, setConsultores] = useState<
    { id: string; name: string }[]
  >([])

  useEffect(() => {
    fetch('/api/users/filtro-options')
      .then((res) => res.json())
      .then((data) => {
        setAdmins(data.admins)
        setConsultores(data.consultores)
      })
      .catch((err) => {
        console.error('Erro ao buscar filtros:', err)
        toast.error('Erro ao carregar filtros')
      })
  }, [])

  useEffect(() => {
    async function fetchLotes() {
      try {
        if (!searchParams) return
        const clienteId = searchParams.get('clienteId')
        const adminId = searchParams.get('adminId')
        const consultorId = searchParams.get('consultorId')

        const queryParams = new URLSearchParams()
        if (clienteId) queryParams.append('clienteId', clienteId)
        if (consultorId) queryParams.append('userId', consultorId)
        if (adminId) queryParams.append('adminId', adminId)

        const url = isConsultor
          ? `/api/lotes/por-consultor?userId=${userId}`
          : `/api/lotes/with-status?${queryParams.toString()}`

        const res = await fetch(url, {
          headers: {
            'x-user-role': role,
            'x-user-id': userId,
          },
        })

        if (!res.ok) throw new Error('Erro na resposta da API')

        const data = await res.json()
        setLotesComStatus(data)
      } catch (err) {
        console.error('Erro ao buscar lotes:', err)
        toast.error('Erro ao buscar lotes')
      }
    }

    fetchLotes()
  }, [role, userId, isConsultor, searchParams])

  const documentosPorLote = Array.isArray(documentos)
    ? documentos.reduce<
        Record<
          string,
          { lote: DocumentoComLote['lote']; docs: DocumentoComLote[] }
        >
      >((acc, doc) => {
        const loteKey = doc.lote?.id || 'sem-lote'
        if (!acc[loteKey]) {
          acc[loteKey] = { lote: doc.lote ?? null, docs: [] }
        }
        acc[loteKey].docs.push(doc)
        return acc
      }, {})
    : {}

  const handleExcluirLote = async (loteId: string) => {
    const confirm = window.confirm('Tem certeza que deseja excluir este lote?')
    if (!confirm) return

    try {
      const res = await fetch(`/api/lotes/${loteId}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Erro ao excluir lote')

      toast.success('Lote excluído com sucesso')
      setLotesComStatus((prev) => prev.filter((l) => l.id !== loteId))
    } catch (err) {
      console.error(err)
      toast.error('Erro ao excluir lote')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documentos</h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <NovoDocumentoModal userId={userId} />
        {role === 'master' && <NovoLoteModal userId={userId} />}
        <ClienteFiltroModal
          admins={admins}
          consultores={consultores}
          userId={userId}
          role={role}
        />
      </div>

      {!loteSelecionado && (
        <table className="w-full text-sm mt-4 bg-white border rounded-xl overflow-hidden shadow">
          <thead className="bg-zinc-100">
            <tr>
              <th className="p-4 text-left">Lote</th>
              <th className="p-4 text-left">Período</th>
              <th className="p-4 text-left">Ação</th>
              <th className="p-4 text-left">Status</th>
              {isGestor && <th className="p-4 text-left"></th>}
            </tr>
          </thead>
          <tbody>
            {[...lotesComStatus]
              .sort(
                (a, b) =>
                  new Date(b.inicio).getTime() - new Date(a.inicio).getTime(),
              )
              .map((lote) => (
                <tr key={lote.id} className="border-t">
                  <td className="p-4 font-semibold">{lote.nome}</td>
                  <td className="p-4">
                    {new Date(lote.inicio).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(lote.fim).toLocaleDateString('pt-BR')}
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
                  <td className="p-4">
                    {isGestor ? (
                      <SelectStatusLote
                        loteId={lote.id}
                        statusAtual={lote.status as DocumentoStatus}
                        onChangeStatus={(novoStatus) => {
                          setLotesComStatus((prev) =>
                            prev.map((l) =>
                              l.id === lote.id
                                ? { ...l, status: novoStatus }
                                : l,
                            ),
                          )
                        }}
                      />
                    ) : (
                      <span className="text-sm text-zinc-600">
                        {lote.status}
                      </span>
                    )}
                  </td>
                  {isGestor && (
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <EditarLoteModal
                          loteId={lote.id}
                          nomeAtual={lote.nome}
                          inicioAtual={lote.inicio}
                          fimAtual={lote.fim}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleExcluirLote(lote.id)}
                          className="text-red-600 hover:bg-red-100"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
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
            variant="ghost"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
            onClick={() => setLoteSelecionado(null)}
          >
            <ArrowLeft size={16} />
            Voltar para lista de lotes
          </Button>

          <DocumentosPorClienteGrouped
            documentos={documentos as any}
            loteSelecionado={loteSelecionado}
            role={role}
            userId={userId}
            refreshDocumentos={fetchDocumentos}
          />
        </>
      )}
    </div>
  )
}
