'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface Props {
  loteId: string
  statusAtual: string
  onChangeStatus: (novo: string) => void
}

export default function SelectStatusLote({
  loteId,
  statusAtual,
  onChangeStatus,
}: Props) {
  async function handleChange(value: string) {
    const res = await fetch(`/api/lotes/${loteId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: value }),
    })

    if (res.ok) {
      onChangeStatus(value)
    }
  }

  return (
    <Select defaultValue={statusAtual} onValueChange={handleChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Selecionar status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Iniciado">Iniciado</SelectItem>
        <SelectItem value="Em análise">Em análise</SelectItem>
        <SelectItem value="Concluído">Concluído</SelectItem>
      </SelectContent>
    </Select>
  )
}
