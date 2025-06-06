'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import useSWR from 'swr'
import { Skeleton } from './ui/skeleton'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLORS = ['#facc15', '#60a5fa', '#22c55e'] // amarelo, azul, verde

const STATUS_LABELS: Record<string, string> = {
  iniciado: 'Iniciado',
  andamento: 'Em andamento',
  finalizado: 'Finalizado',
}

type Props = {
  userId: string
  role: 'consultor' | 'admin' | 'master'
}

export default function DocumentosPie({ userId, role }: Props) {
  const { data, isLoading } = useSWR(
    `/api/stats/document-status?userId=${userId}&role=${role}`,
    fetcher,
  )
  console.log('📊 Dados SWR:', data)

  if (isLoading || !data) {
    return <Skeleton className="w-full h-[300px] rounded-xl" />
  }

  const chartData = Object.entries(data).map(([key, value]) => ({
    name: STATUS_LABELS[key] ?? key,
    value: Number(value),
  }))

  const total = chartData.reduce((acc, item) => acc + item.value, 0)

  return (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Status dos Documentos</h2>
      {total === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum documento encontrado.</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
