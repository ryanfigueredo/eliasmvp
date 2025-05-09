// src/app/lote/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PreviewDocumentoModal from '@/components/PreviewDocumentoModal'

interface Props {
  params: {
    id: string
  }
}

export default async function LotePage({ params }: Props) {
  const lote = await prisma.lote.findUnique({
    where: { id: params.id },
    include: {
      documentos: {
        include: {
          user: true,
        },
        orderBy: { updatedAt: 'desc' },
      },
    },
  })

  if (!lote) return notFound()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{lote.nome}</h1>
      <p className="text-zinc-500 text-sm">
        De {new Date(lote.inicio).toLocaleDateString()} até{' '}
        {new Date(lote.fim).toLocaleDateString()}
      </p>

      <table className="w-full bg-white border text-sm rounded-xl overflow-hidden shadow">
        <thead className="bg-zinc-100 text-left">
          <tr>
            <th className="p-4">Arquivo</th>
            <th className="p-4">Órgão</th>
            <th className="p-4">Status</th>
            <th className="p-4">Usuário</th>
            <th className="p-4">Última atualização</th>
          </tr>
        </thead>
        <tbody>
          {lote.documentos.map((doc) => (
            <tr key={doc.id} className="border-t">
              <td className="p-4">
                <PreviewDocumentoModal fileUrl={doc.fileUrl} />
              </td>
              <td className="p-4">{doc.orgao}</td>
              <td className="p-4">{doc.status}</td>
              <td className="p-4">{doc.user?.name ?? '—'}</td>
              <td className="p-4">
                {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
