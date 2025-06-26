'use client'

import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function DashboardDocumentos() {
  const [lotes, setLotes] = useState<{ id: string; nome: string }[]>([])
  const [loteId, setLoteId] = useState<string>('')
  const [data, setData] = useState<any[]>([])
  const [documentos, setDocumentos] = useState<any[]>([])

  const COLORS = ['#FFBB28', '#8884d8', '#00C49F']

  useEffect(() => {
    fetch('/api/lotes')
      .then((res) => res.json())
      .then((data) => setLotes(data))
  }, [])

  useEffect(() => {
    fetch(`/api/dashboard/document-status?loteId=${loteId}`)
      .then((res) => res.json())
      .then((res) => setData(res))

    fetch(`/api/dashboard/ultimos-documentos?loteId=${loteId}`)
      .then((res) => res.json())
      .then((res) => setDocumentos(res))
  }, [loteId])

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold">Status dos Documentos</h2>
        <select
          className="border px-3 py-2 rounded"
          value={loteId}
          onChange={(e) => setLoteId(e.target.value)}
        >
          <option value="">Todos os lotes</option>
          {lotes.map((lote) => (
            <option key={lote.id} value={lote.id}>
              {lote.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full h-96">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-xl font-bold">Últimos documentos</h2>
        <ul className="space-y-2 mt-4">
          {documentos.map((doc) => (
            <li
              key={doc.id}
              className="bg-white p-4 rounded shadow flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{doc.fileName}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(doc.createdAt).toLocaleDateString('pt-BR')} -{' '}
                  {doc.status}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
