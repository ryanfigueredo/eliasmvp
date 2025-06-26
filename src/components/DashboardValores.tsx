'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface DashboardValoresProps {
  type: 'mensal' | 'semanal'
  role: string
  userId: string
}

export default function DashboardValores({
  type,
  role,
  userId,
}: DashboardValoresProps) {
  const [valor, setValor] = useState<number | null>(null)

  useEffect(() => {
    async function fetchValores() {
      try {
        const res = await fetch(
          `/api/dashboard/valores?tipo=${type}&role=${role}&userId=${userId}`,
        )
        const data = await res.json()
        setValor(data[type])
      } catch (error) {
        console.error('Erro ao buscar valor:', error)
        toast.error('Erro ao buscar valor de documentos')
      }
    }
    fetchValores()
  }, [type, role, userId])

  return (
    <h2 className="text-2xl font-semibold text-emerald-600">
      {valor !== null
        ? `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : 'Carregando...'}
    </h2>
  )
}
