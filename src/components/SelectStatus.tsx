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
      const res = await fetch('/api/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
        credentials: 'include',
      })

      if (res.ok) {
        toast.success('Status atualizado com sucesso!')
        window.location.reload()
      } else {
        const data = await res.json()
        toast.error(data.message || 'Erro ao atualizar status.')
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
      <option value="aguardando">Aguardando</option>
    </select>
  )
}
