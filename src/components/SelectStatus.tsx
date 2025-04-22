'use client'

import { toast } from 'sonner'
import { useTransition } from 'react'

type Props = {
  id: string
  status: string
}

export default function SelectStatus({ id, status }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value

    startTransition(async () => {
      const res = await fetch('/api/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (res.ok) {
        toast.success('Status atualizado com sucesso!')
      } else {
        toast.error('Erro ao atualizar status.')
      }
    })
  }

  return (
    <select
      name="status"
      defaultValue={status}
      className="border rounded px-2 py-1 text-sm"
      onChange={handleChange}
      disabled={isPending}
    >
      <option value="aprovado">Aprovado</option>
      <option value="aguardando">Sem pagamento</option>
      <option value="inativo">Inativo</option>
    </select>
  )
}
