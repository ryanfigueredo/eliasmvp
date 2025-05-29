'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import NovoDocumentoModal from './NovoDocumentoModal'

import { DocumentoStatus } from '@prisma/client'
import NovoLoteModal from './NovoLoteModal'
import EditarLoteModal from './EditarLoteModal'
import { Button } from './ui/button'
import ClientesPorLoteDialog from './ClientesPorLoteDialog'
import { ArrowLeft } from 'lucide-react'
import DocumentosPorClienteGrouped from './DocumentosPorClienteGrouped'

interface Props {
  searchParams: { [key: string]: string | string[] | undefined }
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
    admin?: {
      name: string
    }
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

  const isConsultor = role === 'consultor'
  const isGestor = role === 'master'

  useEffect(() => {
    if (loteSelecionado) return

    async function fetchDocumentos() {
      try {
        const res = await fetch(`/api/document`, {
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
        console.error('Erro no fetchDocumentos inicial:', err)
        toast.error('Erro ao carregar documentos')
      }
    }

    fetchDocumentos()
  }, [loteSelecionado, role, userId])

  useEffect(() => {
    async function fetchLotes() {
      try {
        const url = isConsultor
          ? `/api/lotes/por-consultor?userId=${userId}`
          : `/api/lotes/with-status`

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
        console.error('Erro no fetchLotes:', err)
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
            {
              headers: {
                'x-user-role': role,
                'x-user-id': userId,
              },
            },
          )

          if (!res.ok) throw new Error('Erro na resposta da API')

          const data = await res.json()
          if (!Array.isArray(data)) throw new Error('Resposta inválida')
          setDocumentos(data)
        } catch (err) {
          console.error('Erro no fetchDocs por lote:', err)
          toast.error('Erro ao carregar documentos')
        }
      }
      fetchDocs()
    })
  }, [loteSelecionado, role, userId])

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documentos</h1>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <NovoDocumentoModal userId={userId} />
        {role === 'master' && <NovoLoteModal userId={userId} />}
      </div>

      {!loteSelecionado && (
        <table className="w-full text-sm mt-4 bg-white border rounded-xl overflow-hidden shadow">
          <thead className="bg-zinc-100">
            <tr>
              <th className="p-4 text-left">Lote</th>
              <th className="p-4 text-left">Período</th>
              <th className="p-4 text-left">Ação</th>
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
            variant="ghost"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
            onClick={() => setLoteSelecionado(null)}
          >
            <ArrowLeft size={16} />
            Voltar para lista de lotes
          </Button>

          <DocumentosPorClienteGrouped
            documentos={documentos}
            loteSelecionado={loteSelecionado}
            role={role}
            userId={userId}
          />
        </>
      )}
    </div>
  )
}
