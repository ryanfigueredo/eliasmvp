'use client'

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const COLORS = ['#facc15', '#3b82f6', '#22c55e'] // Amarelo, Azul, Verde

export default function DashboardStats({
  role,
  userId,
}: {
  role: string
  userId: string
}) {
  const [stats, setStats] = useState({
    iniciado: 0,
    andamento: 0,
    finalizado: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(
          `/api/stats/document-status?role=${role}&userId=${userId}`,
        )
        if (!res.ok) throw new Error('Erro ao carregar dados')
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error(error)
        toast.error('Erro ao buscar estatísticas')
      }
    }

    fetchStats()
  }, [role, userId])

  const data = [
    { name: 'Iniciado', value: stats.iniciado },
    { name: 'Em andamento', value: stats.andamento },
    { name: 'Finalizado', value: stats.finalizado },
  ]

  return (
    <div className="bg-white border rounded-xl p-6 shadow">
      <h2 className="text-lg font-semibold mb-4">Visão geral dos documentos</h2>

      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="space-y-2">
          <p className="text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            Iniciados: <strong>{stats.iniciado}</strong>
          </p>
          <p className="text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400" />
            Em andamento: <strong>{stats.andamento}</strong>
          </p>
          <p className="text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400" />
            Finalizados: <strong>{stats.finalizado}</strong>
          </p>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
