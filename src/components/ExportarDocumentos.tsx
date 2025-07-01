'use client'

import { DocumentoStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'

interface Documento {
  cliente?: {
    nome: string
    cpfCnpj?: string
    valor?: number
  }
  user?: {
    name: string
    admin?: { name: string }
  }
  orgao: string
  status: DocumentoStatus
  fileUrl: string
  updatedAt: string
  createdAt?: string
  agrupadorId?: string
  id: string
}

interface Props {
  documentos: Documento[]
}

export default function ExportarDocumentos({ documentos }: Props) {
  const exportarCsv = () => {
    const agrupado = new Map()

    documentos.forEach((doc) => {
      const key = doc.agrupadorId ?? doc.id
      if (!agrupado.has(key)) {
        const valorFormatado =
          typeof doc.cliente?.valor === 'number' && !isNaN(doc.cliente.valor)
            ? doc.cliente.valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            : '—'

        agrupado.set(key, {
          Cliente: doc.cliente?.nome ?? '—',
          CPF_CNPJ: doc.cliente?.cpfCnpj ?? '—',
          Responsável: doc.user?.admin?.name ?? '—',
          InputadoPor: doc.user?.name ?? '—',
          AtualizadoEm: new Date(
            doc.createdAt ?? doc.updatedAt,
          ).toLocaleDateString('pt-BR'),
          Valor: valorFormatado,
        })
      }
    })

    const data = Array.from(agrupado.values())
    const csv = Papa.unparse(data)

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'documentos_por_envio.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportarPdf = () => {
    const agrupado = new Map()

    documentos.forEach((doc) => {
      const key = doc.agrupadorId ?? doc.id
      if (!agrupado.has(key)) {
        const valorFormatado =
          typeof doc.cliente?.valor === 'number' && !isNaN(doc.cliente.valor)
            ? doc.cliente.valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            : '—'

        agrupado.set(key, [
          doc.cliente?.nome ?? '—',
          doc.cliente?.cpfCnpj ?? '—',
          doc.user?.admin?.name ?? '—',
          doc.user?.name ?? '—',
          new Date(doc.createdAt ?? doc.updatedAt).toLocaleDateString('pt-BR'),
          valorFormatado,
        ])
      }
    })

    const data = Array.from(agrupado.values())

    const doc = new jsPDF()
    autoTable(doc, {
      head: [
        [
          'Cliente',
          'CPF/CNPJ',
          'Responsável',
          'Inputado por',
          'Enviado em',
          'Valor',
        ],
      ],
      body: data,
    })
    doc.save('documentos_por_envio.pdf')
  }

  return (
    <div className="flex gap-3 mb-4">
      <Button
        variant="outline"
        onClick={exportarCsv}
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" /> Exportar CSV
      </Button>
      <Button
        variant="outline"
        onClick={exportarPdf}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" /> Exportar PDF
      </Button>
    </div>
  )
}
