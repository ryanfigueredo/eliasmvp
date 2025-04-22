'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

export default function SelectStatusDocumento({
  id,
  status,
}: {
  id: string
  status: 'INICIADO' | 'EM_ANDAMENTO' | 'FINALIZADO'
}) {
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value

    startTransition(async () => {
      const res = await fetch('/api/document/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (res.ok) {
        toast.success('Status atualizado!')
      } else {
        toast.error('Erro ao atualizar status.')
      }
    })
  }

  return (
    <select
      defaultValue={status}
      onChange={handleChange}
      disabled={isPending}
      className="border rounded px-2 py-1 text-sm bg-white"
    >
      <option value="INICIADO">Iniciado</option>
      <option value="EM_ANDAMENTO">Em andamento</option>
      <option value="FINALIZADO">Finalizado</option>
    </select>
  )
}
