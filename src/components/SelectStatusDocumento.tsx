'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import StatusFarol from './StatusFarol'

const statusOptions = [
  { value: 'INICIADO', label: 'Iniciado', color: 'bg-yellow-400' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento', color: 'bg-blue-400' },
  { value: 'FINALIZADO', label: 'Finalizado', color: 'bg-green-400' },
]

export default function SelectStatusDocumento({
  id,
  status,
  refreshDocumentos,
  modoSomenteLeitura = false,
}: {
  id: string
  status: 'INICIADO' | 'EM_ANDAMENTO' | 'FINALIZADO'
  refreshDocumentos?: () => void
  modoSomenteLeitura?: boolean
}) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [isPending, startTransition] = useTransition()

  if (modoSomenteLeitura) {
    return <StatusFarol status={status} />
  }

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as typeof currentStatus
    if (newStatus === currentStatus) return

    startTransition(async () => {
      const res = await fetch('/api/document/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (res.ok) {
        toast.success('Status atualizado!')
        refreshDocumentos?.()
        setCurrentStatus(newStatus)
      } else {
        toast.error('Erro ao atualizar status.')
      }
    })
  }

  const currentColor =
    statusOptions.find((s) => s.value === currentStatus)?.color ?? 'bg-gray-400'

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className="border rounded px-8 py-1 text-sm bg-white appearance-none"
        style={{ backgroundPosition: 'right 0.5rem center' }}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <span
        className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${currentColor}`}
      />
    </div>
  )
}
