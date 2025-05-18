'use client'

interface StatusFarolProps {
  status: 'INICIADO' | 'EM_ANDAMENTO' | 'FINALIZADO' | 'Sem documentos' | string
}

export default function StatusFarol({ status }: StatusFarolProps) {
  const statusMap: Record<
    'INICIADO' | 'EM_ANDAMENTO' | 'FINALIZADO' | 'Sem documentos',
    { label: string; color: string }
  > = {
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
    'Sem documentos': {
      label: 'Nenhum documento enviado',
      color: 'bg-gray-400',
    },
  }

  const { label, color } =
    status in statusMap
      ? statusMap[status as keyof typeof statusMap]
      : {
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
