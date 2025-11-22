'use client'

import { useTransition, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

export default function ApproveUserForm({
  userId,
  currentOwnerId,
}: {
  userId: string
  currentOwnerId?: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [masters, setMasters] = useState<
    Array<{ id: string; name: string; email: string }>
  >([])
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(
    currentOwnerId || '',
  )

  useEffect(() => {
    // Buscar lista de masters
    fetch('/api/users?role=master&status=aprovado')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMasters(data)
          if (!selectedOwnerId && data.length > 0) {
            setSelectedOwnerId(data[0].id)
          }
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar masters:', err)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleApprove = async () => {
    if (!selectedOwnerId) {
      toast.error('Selecione um master para vincular o usuário')
      return
    }

    startTransition(async () => {
      const res = await fetch('/api/approve-user', {
        method: 'POST',
        body: JSON.stringify({ id: userId, ownerId: selectedOwnerId }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        toast.success('Usuário aprovado com sucesso!')
        setOpen(false)
        window.location.reload()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erro ao aprovar usuário.')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Aprovar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aprovar Usuário</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Vincular ao Master:
            </label>
            <select
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              {masters.map((master) => (
                <option key={master.id} value={master.id}>
                  {master.name || master.email} ({master.email})
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500">
              Selecione o master que será responsável por este usuário
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isPending || !selectedOwnerId}
              variant="default"
            >
              {isPending ? 'Aprovando...' : 'Aprovar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
