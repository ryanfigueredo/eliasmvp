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
import { toast } from 'sonner'
import { useState, useTransition } from 'react'

export default function NovoDocumentoModal({ userId }: { userId: string }) {
  const [orgao, setOrgao] = useState('CENPROT')
  const [status, setStatus] = useState('INICIADO')
  const [file, setFile] = useState<File | null>(null)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!file) return toast.error('Selecione um arquivo.')

    startTransition(async () => {
      const fileName = `${Date.now()}-${file.name}`
      const fileUrl = `/uploads/${fileName}`

      console.log({ userId, orgao, status, fileUrl })
      console.log('User ID recebido no modal:', userId)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', userId)
      formData.append('orgao', orgao)
      formData.append('status', status)

      const res = await fetch('/api/document/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        toast.success('Documento salvo com sucesso!')
        setOpen(false)
        setFile(null)
        setStatus('INICIADO')
        setOrgao('CENPROT')
        window.location.reload()
      } else {
        toast.error('Erro ao salvar o documento.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#9C66FF] hover:bg-[#8450e6] text-white">
          + Novo Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white border rounded-xl shadow-xl px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Enviar Documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Órgão</label>
            <select
              value={orgao}
              onChange={(e) => setOrgao(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="CENPROT">CENPROT</option>
              <option value="SPC">SPC</option>
              <option value="SERASA">SERASA</option>
              <option value="BOA_VISTA">BOA VISTA</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="INICIADO">Iniciado</option>
              <option value="EM_ANDAMENTO">Em andamento</option>
              <option value="FINALIZADO">Finalizado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700">Arquivo</label>
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
