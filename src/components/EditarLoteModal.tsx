// components/EditarLoteModal.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState, useTransition } from 'react'
import { Pencil } from 'lucide-react'

interface EditarLoteModalProps {
  loteId: string
  nomeAtual: string
  inicioAtual: string
  fimAtual: string
  onUpdated?: () => void
}

export default function EditarLoteModal({
  loteId,
  nomeAtual,
  inicioAtual,
  fimAtual,
  onUpdated,
}: EditarLoteModalProps) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState(nomeAtual)
  const [inicio, setInicio] = useState(inicioAtual.split('T')[0]) // Formatar como yyyy-mm-dd
  const [fim, setFim] = useState(fimAtual.split('T')[0])
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nome || !inicio || !fim) {
      return toast.error('Preencha todos os campos obrigatórios.')
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/lotes/${loteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, inicio, fim }),
        })

        if (res.ok) {
          toast.success('Lote atualizado com sucesso!')
          setOpen(false)
          if (onUpdated) onUpdated()
          window.location.reload()
        } else {
          toast.error('Erro ao atualizar lote.')
        }
      } catch (error) {
        console.error(error)
        toast.error('Erro inesperado.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md border rounded-xl shadow-xl px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Editar Lote
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input
            placeholder="Nome do lote"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
          <Input
            type="date"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
