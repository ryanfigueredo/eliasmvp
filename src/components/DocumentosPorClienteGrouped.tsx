'use client'

import { DocumentoStatus } from '@prisma/client'
import { useState } from 'react'
import { Download, Eye } from 'lucide-react'
import PreviewDocumentoModal from './PreviewDocumentoModal'
import SelectStatusDocumento from './SelectStatusDocumento'
import StatusFarol from './StatusFarol'
import { Button } from './ui/button'
import ExportarDocumentos from './ExportarDocumentos'

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
  refreshDocumentos,
}: Props) {
  const isGestor = role === 'master'
  const isAdmin = role === 'admin'
  const [openCliente, setOpenCliente] = useState<string | null>(null)

  // 🔎 Filtro apenas do lote selecionado
  const documentosFiltrados = documentos.filter(
    (doc) => doc.lote?.id === loteSelecionado,
  )

  const documentosPorInputador = documentosFiltrados.reduce<
    Record<string, { nome: string; documentos: DocumentoComLote[] }>
  >((acc, doc) => {
    const inputador = doc.user?.name ?? `Desconhecido-${doc.id}`

    if (!acc[inputador]) {
      acc[inputador] = {
        nome: inputador,
        documentos: [],
      }
    }

    acc[inputador].documentos.push(doc)
    return acc
  }, {})

  return (
    <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 border rounded-xl">
      {(isGestor || isAdmin) && (
        <ExportarDocumentos documentos={documentosFiltrados} />
      )}

      {Object.entries(documentosPorInputador)
        .sort(([, a], [, b]) => {
          const aDate = new Date(a.documentos[0].updatedAt).getTime()
          const bDate = new Date(b.documentos[0].updatedAt).getTime()
          return bDate - aDate
        })
        .map(([inputador, { nome, documentos }]) => {
          const docsOrdenados = documentos.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )

          return (
            <div key={inputador} className="border rounded-xl shadow">
              <div className="flex justify-between items-center p-4 bg-zinc-100">
                <div>
                  <p className="font-semibold text-zinc-700">
                    {nome} ({documentos.length} documentos)
                  </p>
                  <div className="text-sm text-zinc-500">
                    Última atualização:{' '}
                    {new Date(docsOrdenados[0].updatedAt).toLocaleDateString(
                      'pt-BR',
                    )}
                  </div>
                  <div className="text-sm text-zinc-500 mt-1">
                    <span className="font-medium">Responsável: </span>
                    {docsOrdenados[0].user?.admin?.name ??
                      (isGestor || isAdmin ? docsOrdenados[0].user?.name : '—')}
                  </div>
                  <div className="text-sm text-zinc-500">
                    <span className="font-medium">Inputado por: </span>
                    {docsOrdenados[0].user?.name ?? '—'}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {isGestor ? (
                    <SelectStatusDocumento
                      id={docsOrdenados[0].id}
                      status={docsOrdenados[0].status}
                      refreshDocumentos={refreshDocumentos}
                    />
                  ) : (
                    <StatusFarol status={docsOrdenados[0].status} />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setOpenCliente(
                        openCliente === inputador ? null : inputador,
                      )
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver documentos
                  </Button>
                </div>
              </div>

              {openCliente === inputador && (
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
                    {docsOrdenados.map((doc, i) => (
                      <tr key={doc.id} className="border-t">
                        <td className="p-4">Documento {i + 1}</td>
                        <td className="p-4">
                          {doc.user?.admin?.name ??
                            (isGestor || isAdmin ? doc.user?.name : '—')}
                        </td>
                        <td className="p-4">{doc.user?.name ?? '—'}</td>
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
