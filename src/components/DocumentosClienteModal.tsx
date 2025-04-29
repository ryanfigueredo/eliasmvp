'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, FileText, FileWarning, Upload } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

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
  const [tipo, setTipo] = useState('RG')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    fetchDocumentos()
  }, [open, clienteId])

  const fetchDocumentos = async () => {
    const res = await fetch(`/api/cliente/${clienteId}/documentos`)
    if (res.ok) {
      const data = await res.json()
      setDocumentos(data)
    } else {
      setDocumentos([])
    }
  }

  const handleUpload = () => {
    if (!arquivo) {
      toast.error('Selecione um arquivo.')
      return
    }

    const formData = new FormData()
    formData.append('tipo', tipo)
    formData.append('file', arquivo)

    startTransition(async () => {
      const res = await fetch(`/api/cliente/${clienteId}/documentos`, {
        // 🔥 corrigido aqui
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        toast.success('Documento enviado com sucesso!')
        setArquivo(null)
        setTipo('RG')
        await fetchDocumentos()
      } else {
        toast.error('Erro ao enviar o documento.')
      }
    })
  }

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
          <DialogTitle className="text-lg font-semibold">
            Documentos do cliente
          </DialogTitle>
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
                <div className="flex items-center gap-2">
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
              </div>
            ))
          )}
        </div>

        {/* Área de upload */}
        <div className="border-t pt-4 mt-6 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700">
              Tipo do documento
            </label>
            <select
              className="border rounded px-3 py-2 text-sm"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="RG">RG</option>
              <option value="CNH">CNH</option>
              <option value="Contrato">Contrato</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-700">Arquivo</label>
            <Input
              type="file"
              onChange={(e) => setArquivo(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleUpload}
              disabled={isPending}
              className="flex gap-2 bg-[#9C66FF] text-white hover:bg-[#8450e6]"
            >
              <Upload className="w-4 h-4" />
              {isPending ? 'Enviando...' : 'Enviar documento'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
