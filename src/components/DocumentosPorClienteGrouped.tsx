import { DocumentoStatus } from '@prisma/client'
import { useState } from 'react'
import { Download, Eye } from 'lucide-react'
import PreviewDocumentoModal from './PreviewDocumentoModal'
import SelectStatusDocumento from './SelectStatusDocumento'
import StatusFarol from './StatusFarol'
import { Button } from './ui/button'

interface Documento {
  id: string
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
    nome: string
    user?: { name: string }
  }
}

interface Props {
  documentos: Documento[]
  loteSelecionado: string
  role: string
  userId: string
}

export default function DocumentosPorClienteGrouped({
  documentos,
  role,
}: Props) {
  const isGestor = role === 'master'
  const [openCliente, setOpenCliente] = useState<string | null>(null)

  const documentosPorCliente = documentos.reduce(
    (acc: Record<string, Documento[]>, doc) => {
      const key = doc.cliente?.nome || 'Desconhecido'
      if (!acc[key]) acc[key] = []
      acc[key].push(doc)
      return acc
    },
    {},
  )

  return (
    <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 border rounded-xl">
      {Object.entries(documentosPorCliente)
        .sort(
          ([, docsA], [, docsB]) =>
            new Date(docsB[0].updatedAt).getTime() -
            new Date(docsA[0].updatedAt).getTime(),
        )
        .map(([cliente, docs]) => {
          const docsOrdenados = docs.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )

          return (
            <div key={cliente} className="border rounded-xl shadow">
              <div className="flex justify-between items-center p-4 bg-zinc-100">
                <div>
                  <p className="font-semibold text-zinc-700">{cliente}</p>
                  <div className="text-sm text-zinc-500">
                    Última atualização:{' '}
                    {new Date(docsOrdenados[0].updatedAt).toLocaleDateString(
                      'pt-BR',
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {isGestor ? (
                    <SelectStatusDocumento
                      id={docsOrdenados[0].id}
                      status={docsOrdenados[0].status}
                    />
                  ) : (
                    <StatusFarol status={docsOrdenados[0].status} />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setOpenCliente(openCliente === cliente ? null : cliente)
                    }
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver documentos
                  </Button>
                </div>
              </div>

              {openCliente === cliente && (
                <table className="w-full bg-white text-sm">
                  <thead className="bg-zinc-50">
                    <tr>
                      <th className="p-4 text-left">Tipo</th>
                      <th className="p-4 text-left">Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docsOrdenados.map((doc, i) => (
                      <tr key={doc.id} className="border-t">
                        <td className="p-4">Documento {i + 1}</td>
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
