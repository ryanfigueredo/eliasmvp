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

export default function NovoLoteModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [nome, setNome] = useState('')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !inicio || !fim) {
      return toast.error('Preencha todos os campos.')
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/lotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, inicio, fim }),
        })

        if (res.ok) {
          toast.success('Lote criado com sucesso!')
          setOpen(false)
          window.location.reload()
        } else {
          toast.error('Erro ao criar lote.')
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
        <Button className="bg-[#9C66FF] hover:bg-[#8450e6] text-white">
          + Novo Lote
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-white border rounded-xl shadow-xl px-6 py-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Novo Lote</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input
            placeholder="Nome do lote"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <div className="space-y-1">
            <label className="text-sm font-medium">Data de Início</label>
            <Input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Data de Fim</label>
            <Input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
