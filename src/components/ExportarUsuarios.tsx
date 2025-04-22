'use client'

import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import { User } from '@prisma/client'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Props {
  data: Pick<User, 'name' | 'email' | 'cpf' | 'role' | 'status' | 'createdAt'>[]
}

export default function ExportarUsuarios({ data }: Props) {
  const exportarCsv = () => {
    const csv = Papa.unparse(
      data.map((user) => ({
        Nome: user.name,
        Email: user.email,
        CPF: user.cpf,
        Cargo: user.role,
        Status: user.status,
        CriadoEm: new Date(user.createdAt).toLocaleDateString(),
      })),
    )

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'usuarios.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportarPdf = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [['Nome', 'Email', 'CPF', 'Cargo', 'Status', 'Criado em']],
      body: data.map((user) => [
        user.name,
        user.email,
        user.cpf,
        user.role,
        user.status,
        new Date(user.createdAt).toLocaleDateString(),
      ]),
    })
    doc.save('usuarios.pdf')
  }

  return (
    <div className="flex gap-3">
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
