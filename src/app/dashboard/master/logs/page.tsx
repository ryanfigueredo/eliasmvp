'use client'

import { useEffect, useState } from 'react'

type Log = {
  id: string
  acao: string
  detalhes: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/logs')

        if (!res.ok) {
          const error = await res.json()
          console.error('Erro da API:', error)
          setLogs([])
          return
        }

        const data = await res.json()

        if (Array.isArray(data)) {
          setLogs(data)
        } else {
          console.error('Resposta inesperada:', data)
          setLogs([])
        }
      } catch (err) {
        console.error('Erro ao buscar logs:', err)
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Histórico de Ações</h1>

      {loading ? (
        <p className="text-sm text-zinc-500">Carregando...</p>
      ) : (
        <table className="w-full text-sm bg-white border rounded-xl overflow-hidden shadow">
          <thead className="bg-zinc-100 text-left">
            <tr>
              <th className="p-4">Usuário</th>
              <th className="p-4">Ação</th>
              <th className="p-4">Detalhes</th>
              <th className="p-4">Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="border-t">
                  <td className="p-4">
                    {log.user?.name || '—'}
                    <br />
                    <span className="text-xs text-zinc-500">
                      {log.user.email}
                    </span>
                  </td>
                  <td className="p-4">{log.acao}</td>
                  <td className="p-4">{log.detalhes}</td>
                  <td className="p-4">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center text-zinc-500 p-6">
                  Nenhuma ação registrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
