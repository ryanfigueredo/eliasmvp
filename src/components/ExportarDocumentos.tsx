'use client'

import { DocumentoStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'

interface Documento {
  cliente?: { nome: string }
  user?: {
    name: string
    admin?: { name: string }
  }
  orgao: string
  status: DocumentoStatus
  fileUrl: string
  updatedAt: string
}

interface Props {
  documentos: Documento[]
}

export default function ExportarDocumentos({ documentos }: Props) {
  const exportarCsv = () => {
    const csv = Papa.unparse(
      documentos.map((doc) => ({
        Cliente: doc.cliente?.nome ?? '—',
        Responsável: doc.user?.admin?.name ?? '—',
        InputadoPor: doc.user?.name ?? '—',
        Orgao: doc.orgao,
        Status: doc.status,
        Arquivo: doc.fileUrl,
        AtualizadoEm: new Date(doc.updatedAt).toLocaleDateString('pt-BR'),
      })),
    )

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'documentos.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportarPdf = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [
        [
          'Cliente',
          'Responsável',
          'Inputado por',
          'Órgão',
          'Status',
          'Arquivo',
          'Atualizado em',
        ],
      ],
      body: documentos.map((d) => [
        d.cliente?.nome ?? '—',
        d.user?.admin?.name ?? '—',
        d.user?.name ?? '—',
        d.orgao,
        d.status,
        d.fileUrl,
        new Date(d.updatedAt).toLocaleDateString('pt-BR'),
      ]),
    })
    doc.save('documentos.pdf')
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
