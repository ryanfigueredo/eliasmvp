'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, FileWarning } from 'lucide-react'
import { useEffect, useState } from 'react'

type Documento = {
  id: string
  tipo: string
  fileUrl: string
}

export default function DocumentosClienteModal({
  clienteId,
}: {
  clienteId: string
}) {
  const [open, setOpen] = useState(false)
  const [documentos, setDocumentos] = useState<Documento[]>([])

  useEffect(() => {
    if (!open) return
    fetch(`/api/cliente/${clienteId}/documentos`)
      .then((res) => res.json())
      .then(setDocumentos)
      .catch(() => setDocumentos([]))
  }, [open, clienteId])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Ver documentos
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg bg-white rounded-xl shadow-xl px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-lg">Documentos do cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {documentos.length === 0 ? (
            <div className="text-sm text-zinc-500 flex items-center gap-2">
              <FileWarning className="w-5 h-5" />
              Nenhum documento enviado.
            </div>
          ) : (
            documentos.map((doc) => (
              <div
                key={doc.id}
                className="flex justify-between items-center border p-3 rounded-md text-sm"
              >
                <span className="font-medium">{doc.tipo}</span>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Visualizar
                </a>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
