'use client'

import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

export default function ExcluirDocumentoButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/document/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Documento excluído com sucesso!')
        window.location.reload()
      } else {
        toast.error('Erro ao excluir documento.')
      }
    } catch (error) {
      toast.error('Erro inesperado ao excluir.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm bg-white rounded-xl shadow-md p-6">
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-zinc-600">
          Tem certeza que deseja excluir este documento?
        </p>

        <div className="flex justify-end gap-2 pt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleDelete} className="bg-red-600 text-white">
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
