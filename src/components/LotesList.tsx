'use client'

import { useEffect, useState } from 'react'

interface Lote {
  id: string
  nome: string
  inicio: string
  fim: string
}

export default function LotesList() {
  const [lotes, setLotes] = useState<Lote[]>([])

  useEffect(() => {
    async function fetchLotes() {
      const res = await fetch('/api/lotes')
      const data = await res.json()
      setLotes(data)
    }

    fetchLotes()
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Lotes de Documentos</h2>
      <ul className="space-y-2">
        {lotes.map((lote) => (
          <li key={lote.id} className="p-4 bg-white rounded shadow">
            <strong>{lote.nome}</strong>
            <p>
              De {new Date(lote.inicio).toLocaleDateString()} até{' '}
              {new Date(lote.fim).toLocaleDateString()}
            </p>
            <a
              href={`/lote/${lote.id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              Ver documentos
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
