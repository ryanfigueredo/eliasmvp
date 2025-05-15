// components/StatusFarol.tsx
'use client'

interface StatusFarolProps {
  status: string
}

export default function StatusFarol({ status }: StatusFarolProps) {
  const statusMap: Record<string, { label: string; color: string }> = {
    INICIADO: {
      label: 'Iniciado',
      color: 'bg-yellow-400',
    },
    EM_ANDAMENTO: {
      label: 'Em andamento',
      color: 'bg-blue-400',
    },
    FINALIZADO: {
      label: 'Finalizado',
      color: 'bg-green-400',
    },
    SEM_DOCUMENTOS: {
      label: 'Sem documentos',
      color: 'bg-gray-400',
    },
  }

  const fallback = { label: status ?? 'Desconhecido', color: 'bg-red-400' }
  const { label, color } = statusMap[status] ?? fallback

  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}
