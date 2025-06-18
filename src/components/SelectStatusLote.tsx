'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const statusOptions = [
  { value: 'INICIADO', label: 'Iniciado', color: 'bg-yellow-400' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento', color: 'bg-blue-400' },
  { value: 'FINALIZADO', label: 'Finalizado', color: 'bg-green-400' },
]

interface Props {
  loteId: string
  statusAtual: 'INICIADO' | 'EM_ANDAMENTO' | 'FINALIZADO'
  onChangeStatus: (novo: string) => void
}

export default function SelectStatusLote({
  loteId,
  statusAtual,
  onChangeStatus,
}: Props) {
  const [currentStatus, setCurrentStatus] = useState(statusAtual)
  const [isPending, startTransition] = useTransition()

  async function handleChange(value: string) {
    if (value === currentStatus) return

    startTransition(async () => {
      const res = await fetch(`/api/lotes/${loteId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: value }),
      })

      if (res.ok) {
        setCurrentStatus(value as Props['statusAtual'])
        onChangeStatus(value)
        toast.success(
          `Status alterado para "${statusOptions.find((s) => s.value === value)?.label}"`,
        )
      } else {
        toast.error('Erro ao alterar status do lote.')
      }
    })
  }

  const currentColor =
    statusOptions.find((s) => s.value === currentStatus)?.color ?? 'bg-gray-400'

  return (
    <div className="relative">
      <Select value={currentStatus} onValueChange={handleChange}>
        <SelectTrigger className="w-[170px] border px-8 py-1 text-sm bg-white">
          <SelectValue placeholder="Selecionar status" />
        </SelectTrigger>
        <SelectContent className="bg-white rounded-md shadow-md">
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span
        className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${currentColor}`}
      />
    </div>
  )
}
