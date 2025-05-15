// components/StatusFarol.tsx
'use client'

interface StatusFarolProps {
  status: 'INICIADO' | 'EM_ANDAMENTO' | 'FINALIZADO'
}

export default function StatusFarol({ status }: StatusFarolProps) {
  const statusMap = {
    INICIADO: {
      label: 'Iniciado',
      color: 'bg-yellow-400',
    },
    EM_ANDAMENTO: {
      label: 'Em andamento',
      color: 'bg-blue-500',
    },
    FINALIZADO: {
      label: 'Finalizado',
      color: 'bg-green-500',
    },
  }

  const { label, color } = statusMap[status] ?? {
    label: 'Desconhecido',
    color: 'bg-gray-400',
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}
