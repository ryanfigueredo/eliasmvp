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
import { useSession } from 'next-auth/react'

interface Props {
  userId: string
}

export default function NovoLoteModal({ userId }: Props) {
  const [open, setOpen] = useState(false)
  const [nome, setNome] = useState('')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!nome || !inicio || !fim) {
      return toast.error('Preencha todos os campos obrigatórios.')
    }

    if (new Date(inicio) > new Date(fim)) {
      return toast.error('A data final não pode ser anterior à inicial.')
    }

    if (!userId) {
      return toast.error('Usuário não autenticado.')
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/lotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, inicio, fim, userId }),
        })

        if (res.ok) {
          toast.success('Lote criado com sucesso!')
          setOpen(false)
          setNome('')
          setInicio('')
          setFim('')
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
          <DialogTitle className="text-lg font-semibold">
            Criar Novo Lote
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input
            placeholder="Nome do lote"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Data de início</label>
            <Input
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Data de término</label>
            <Input
              type="date"
              value={fim}
              onChange={(e) => setFim(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Criando...' : 'Criar Lote'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
