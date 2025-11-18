'use client'

import { DocumentoStatus } from '@prisma/client'
import { useState } from 'react'
import { Eye, Trash2, Tags } from 'lucide-react'
import PreviewDocumentoModal from './PreviewDocumentoModal'
import EditarCategoriaDocumentoModal from './EditarCategoriaDocumentoModal'
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
  categoriaServico?: {
    id: string
    nome: string
  } | null
  user?: {
    name: string
    admin?: {
      name: string
    }
  }
  cliente?: {
    id: string
    nome: string
    cpfCnpj: string
    valor?: number
    limite?: number | null
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
  const [openCategoria, setOpenCategoria] = useState<string | null>(null)

  const documentosFiltrados = documentos.filter(
    (doc) => doc.lote?.id === loteSelecionado,
  )

  // Agrupar primeiro por categoria
  const documentosPorCategoria = documentosFiltrados.reduce<
    Record<
      string,
      {
        categoriaId: string | null
        categoriaNome: string
        documentos: DocumentoComLote[]
      }
    >
  >((acc, doc) => {
    const categoriaKey = doc.categoriaServico?.id || 'sem-categoria'
    const categoriaNome = doc.categoriaServico?.nome || 'Sem categoria'

    if (!acc[categoriaKey]) {
      acc[categoriaKey] = {
        categoriaId: doc.categoriaServico?.id || null,
        categoriaNome,
        documentos: [],
      }
    }
    acc[categoriaKey].documentos.push(doc)
    return acc
  }, {})

  // Dentro de cada categoria, agrupar por envio (agrupadorId)
  const categoriasComEnvios = Object.entries(documentosPorCategoria).map(
    ([categoriaKey, { categoriaId, categoriaNome, documentos: docs }]) => {
      const enviosPorCategoria = docs.reduce<
        Record<string, { documentos: DocumentoComLote[] }>
      >((acc, doc) => {
        const chave = doc.agrupadorId ?? doc.id
        if (!acc[chave]) {
          acc[chave] = { documentos: [] }
        }
        acc[chave].documentos.push(doc)
        return acc
      }, {})

      return {
        categoriaKey,
        categoriaId,
        categoriaNome,
        envios: Object.entries(enviosPorCategoria).map(([grupoId, { documentos }]) => ({
          grupoId,
          documentos,
        })),
      }
    },
  )

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
          credentials: 'include',
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
    <div className="space-y-6">
      {(isGestor || isAdmin) && (
        <ExportarDocumentos
          documentos={documentosFiltrados.map((doc) => ({
            ...doc,
            agrupadorId: doc.agrupadorId ?? undefined,
          }))}
        />
      )}

      {categoriasComEnvios.length === 0 && (
        <div className="text-center text-sm text-zinc-500 mt-4 p-8 border rounded-xl">
          Nenhum documento encontrado para este lote.
        </div>
      )}

      {categoriasComEnvios
        .sort((a, b) => {
          // Sem categoria vai pro final
          if (a.categoriaKey === 'sem-categoria') return 1
          if (b.categoriaKey === 'sem-categoria') return -1
          // Ordenar por nome da categoria
          return a.categoriaNome.localeCompare(b.categoriaNome)
        })
        .map(({ categoriaKey, categoriaId, categoriaNome, envios }) => {
          const totalDocsNaCategoria = envios.reduce(
            (sum, envio) => sum + envio.documentos.length,
            0,
          )

          return (
            <div key={categoriaKey} className="border rounded-xl shadow-sm overflow-hidden">
              {/* Header da Categoria */}
              <div
                className="flex justify-between items-center p-4 bg-gradient-to-r from-zinc-50 to-zinc-100 border-b cursor-pointer hover:bg-zinc-100 transition-colors"
                onClick={() =>
                  setOpenCategoria(
                    openCategoria === categoriaKey ? null : categoriaKey,
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[color-mix(in_oklab,var(--brand-primary)_12%,transparent)] text-[var(--brand-primary)] flex items-center justify-center">
                    <Tags className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-lg">
                      {categoriaNome}
                    </h3>
                    <p className="text-sm text-zinc-600">
                      {totalDocsNaCategoria} documento{totalDocsNaCategoria !== 1 ? 's' : ''} • {envios.length} envio{envios.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenCategoria(
                      openCategoria === categoriaKey ? null : categoriaKey,
                    )
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {openCategoria === categoriaKey ? 'Ocultar' : 'Ver envios'}
                </Button>
              </div>

              {/* Lista de Envios dentro da Categoria */}
              {openCategoria === categoriaKey && (
                <div className="divide-y">
                  {envios
                    .sort((a, b) => {
                      const aDate = new Date(
                        a.documentos[0].updatedAt,
                      ).getTime()
                      const bDate = new Date(
                        b.documentos[0].updatedAt,
                      ).getTime()
                      return bDate - aDate
                    })
                    .map(({ grupoId, documentos }) => {
                      const clienteNome =
                        documentos[0].cliente?.nome ??
                        'Cliente não identificado'
                      const responsavel =
                        documentos[0].user?.admin?.name ?? '—'
                      const inputado = documentos[0].user?.name ?? '—'
                      const limite = documentos[0].cliente?.limite

                      const docsOrdenados = documentos.sort(
                        (a, b) =>
                          new Date(b.updatedAt).getTime() -
                          new Date(a.updatedAt).getTime(),
                      )

                      return (
                        <div
                          key={grupoId}
                          className="bg-white border-l-4 border-l-[var(--brand-primary)]"
                        >
                          <div className="flex justify-between items-center p-4 bg-white hover:bg-zinc-50 transition-colors">
                            <div className="flex-1">
                              <p className="font-semibold text-zinc-900">
                                {clienteNome} ({documentos.length} documento
                                {documentos.length !== 1 ? 's' : ''})
                              </p>
                              <div className="text-sm text-zinc-600 mt-1">
                                Enviado em:{' '}
                                {new Date(
                                  docsOrdenados[0].createdAt ??
                                    docsOrdenados[0].updatedAt,
                                ).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                              <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
                                <span>
                                  <span className="font-medium">Responsável: </span>
                                  {responsavel}
                                </span>
                                <span>
                                  <span className="font-medium">Inputado por: </span>
                                  {inputado}
                                </span>
                                {limite && (
                                  <span>
                                    <span className="font-medium">Limite: </span>
                                    {limite.toLocaleString('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL',
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  const idOuGrupo =
                                    documentos[0].agrupadorId ||
                                    documentos[0].id
                                  handleExcluirGrupo(idOuGrupo)
                                }}
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setOpenGrupo(
                                    openGrupo === grupoId ? null : grupoId,
                                  )
                                }
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver documentos
                              </Button>
                            </div>
                          </div>

                          {openGrupo === grupoId && (
                            <div className="bg-zinc-50 border-t">
                              <table className="w-full bg-white text-sm">
                                <thead className="bg-zinc-100">
                                  <tr>
                                    <th className="p-3 text-left text-xs font-semibold text-zinc-700">
                                      Tipo
                                    </th>
                                    <th className="p-3 text-left text-xs font-semibold text-zinc-700">
                                      Responsável
                                    </th>
                                    <th className="p-3 text-left text-xs font-semibold text-zinc-700">
                                      Inputado por
                                    </th>
                                    <th className="p-3 text-left text-xs font-semibold text-zinc-700">
                                      Visualizar
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {docsOrdenados.map((doc) => (
                                    <tr
                                      key={doc.id}
                                      className="border-t hover:bg-zinc-50"
                                    >
                                      <td className="p-3">
                                        {doc.tipo
                                          ? doc.tipo
                                              .charAt(0)
                                              .toUpperCase() +
                                            doc.tipo.slice(1).toLowerCase()
                                          : 'Documento desconhecido'}
                                      </td>
                                      <td className="p-3 text-zinc-600">
                                        {responsavel}
                                      </td>
                                      <td className="p-3 text-zinc-600">
                                        {inputado}
                                      </td>
                                      <td className="p-3">
                                        <div className="flex items-center gap-2">
                                          <PreviewDocumentoModal
                                            fileUrl={doc.fileUrl}
                                          />
                                          <EditarCategoriaDocumentoModal
                                            documentoId={doc.id}
                                            categoriaAtualId={
                                              doc.categoriaServico?.id || null
                                            }
                                            categoriaAtualNome={
                                              doc.categoriaServico?.nome || null
                                            }
                                            onUpdated={refreshDocumentos}
                                          />
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          )
        })}
    </div>
  )
}
