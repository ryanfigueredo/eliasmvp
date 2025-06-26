'use client'

import { DocumentoStatus } from '@prisma/client'
import { useState, useEffect } from 'react'
import { Download, Eye, Trash2 } from 'lucide-react'
import PreviewDocumentoModal from './PreviewDocumentoModal'
import { Button } from './ui/button'
import ExportarDocumentos from './ExportarDocumentos'
import { toast } from 'sonner'

interface DocumentoComLote {
  id: string
  tipo?: string
  agrupadorId?: string | null
  userId: string
  orgao: string
  status: DocumentoStatus
  fileUrl: string
  updatedAt: string
  createdAt?: string
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

interface Props {
  documentos: DocumentoComLote[]
  loteSelecionado: string
  role: string
  userId: string
  refreshDocumentos: () => Promise<void>
}

export default function DocumentosPorClienteGrouped({
  documentos,
  loteSelecionado,
  role,
  userId,
  refreshDocumentos,
}: Props) {
  const isGestor = role === 'master'
  const isAdmin = role === 'admin'
  const [openGrupo, setOpenGrupo] = useState<string | null>(null)

  const documentosFiltrados = documentos.filter(
    (doc) => doc.lote?.id === loteSelecionado,
  )

  const documentosPorEnvio = documentosFiltrados.reduce<
    Record<string, { documentos: DocumentoComLote[] }>
  >((acc, doc) => {
    const chave = doc.agrupadorId ?? `sem-grupo-${doc.id}`
    if (!acc[chave]) {
      acc[chave] = { documentos: [] }
    }
    acc[chave].documentos.push(doc)
    return acc
  }, {})

  async function handleExcluirGrupo(agrupadorId: string) {
    const confirm = window.confirm(
      'Tem certeza que deseja excluir todos os documentos deste envio?',
    )
    if (!confirm) return

    try {
      const res = await fetch(
        `/api/document/delete?agrupadorId=${agrupadorId}`,
        {
          method: 'DELETE',
        },
      )

      if (!res.ok) throw new Error('Erro ao excluir documentos')

      toast.success('Documentos do grupo excluídos com sucesso.')
      await refreshDocumentos()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao excluir documentos')
    }
  }

  return (
    <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 border rounded-xl">
      {(isGestor || isAdmin) && (
        <ExportarDocumentos documentos={documentosFiltrados} />
      )}

      {Object.entries(documentosPorEnvio).length === 0 && (
        <div className="text-center text-sm text-zinc-500 mt-4">
          Nenhum documento encontrado para este lote.
        </div>
      )}

      {Object.entries(documentosPorEnvio)
        .sort(([, a], [, b]) => {
          const aDate = new Date(a.documentos[0].updatedAt).getTime()
          const bDate = new Date(b.documentos[0].updatedAt).getTime()
          return bDate - aDate
        })
        .map(([grupoId, { documentos }]) => {
          const clienteNome =
            documentos[0].cliente?.nome ?? 'Cliente não identificado'
          const responsavel = documentos[0].user?.admin?.name ?? '—'
          const inputado = documentos[0].user?.name ?? '—'

          const docsOrdenados = documentos.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )

          return (
            <div key={grupoId} className="border rounded-xl shadow">
              <div className="flex justify-between items-center p-4 bg-zinc-100">
                <div>
                  <p className="font-semibold text-zinc-700">
                    {clienteNome} ({documentos.length} documentos)
                  </p>
                  <div className="text-sm text-zinc-500">
                    Enviado em:{' '}
                    {new Date(
                      docsOrdenados[0].createdAt ?? docsOrdenados[0].updatedAt,
                    ).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-sm text-zinc-500 mt-1">
                    <span className="font-medium">Responsável: </span>
                    {responsavel}
                  </div>
                  <div className="text-sm text-zinc-500">
                    <span className="font-medium">Inputado por: </span>
                    {inputado}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => handleExcluirGrupo(grupoId)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setOpenGrupo(openGrupo === grupoId ? null : grupoId)
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver documentos
                  </Button>
                </div>
              </div>

              {openGrupo === grupoId && (
                <table className="w-full bg-white text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="p-4 text-left">Tipo</th>
                      <th className="p-4 text-left">Responsável</th>
                      <th className="p-4 text-left">Inputado por</th>
                      <th className="p-4 text-left">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docsOrdenados.map((doc) => (
                      <tr key={doc.id} className="border-t">
                        <td className="p-4">
                          {doc.tipo
                            ? doc.tipo.charAt(0).toUpperCase() +
                              doc.tipo.slice(1).toLowerCase()
                            : 'Documento desconhecido'}
                        </td>
                        <td className="p-4">{responsavel}</td>
                        <td className="p-4">{inputado}</td>
                        <td className="p-4 flex items-center gap-2">
                          <PreviewDocumentoModal fileUrl={doc.fileUrl} />
                          <a
                            href={doc.fileUrl}
                            download
                            className="text-sm text-zinc-600 hover:text-zinc-900"
                          >
                            <Download size={18} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )
        })}
    </div>
  )
}
