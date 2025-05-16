'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import useSWR from 'swr'
import { Skeleton } from './ui/skeleton'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const COLORS = ['#facc15', '#60a5fa', '#22c55e'] // amarelo, azul, verde

const STATUS_LABELS: Record<string, string> = {
  INICIADO: 'Iniciado',
  EM_ANDAMENTO: 'Em andamento',
  FINALIZADO: 'Finalizado',
}

export default function DocumentosPieConsultor({ userId }: { userId: string }) {
  const { data, isLoading } = useSWR(
    `/api/stats/consultor-status?userId=${userId}`,
    fetcher,
  )

  if (isLoading || !data) {
    return <Skeleton className="w-full h-[300px] rounded-xl" />
  }

  const chartData: { name: string; value: number }[] = Object.entries(data).map(
    ([status, count]) => ({
      name: STATUS_LABELS[status],
      value: Number(count),
    }),
  )

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
