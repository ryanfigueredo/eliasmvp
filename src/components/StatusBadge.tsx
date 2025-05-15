// components/StatusBadge.tsx
'use client'

interface Props {
  status: string // deixa flexível para garantir segurança
}

export default function StatusBadge({ status }: Props) {
  const statusMap = {
    INICIADO: {
      label: 'Iniciado',
      className: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    },
    EM_ANDAMENTO: {
      label: 'Em andamento',
      className: 'bg-blue-100 text-blue-800 border border-blue-300',
    },
    FINALIZADO: {
      label: 'Finalizado',
      className: 'bg-green-100 text-green-800 border border-green-300',
    },
  }

  const { label, className } = statusMap[status as keyof typeof statusMap] ?? {
    label: 'Desconhecido',
    className: 'bg-gray-100 text-gray-800 border border-gray-300',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}
