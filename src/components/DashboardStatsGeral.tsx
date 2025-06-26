'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

type Props = {
  userId: string
  role: 'consultor' | 'admin' | 'master'
}

export default function DashboardStatsGeral({ userId, role }: Props) {
  const [data, setData] = useState<null | {
    totalClientes: number
    totalDocumentos: number
    finalizados: number
    totalValor: number
  }>(null)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/stats/geral?userId=${userId}&role=${role}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => toast.error('Erro ao buscar estatísticas'))
      .finally(() => setIsLoading(false))
  }, [userId, role])

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{data.totalClientes}</p>
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{data.totalDocumentos}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Finalizados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-green-600">
            {data.finalizados}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valor Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-zinc-800">
            {' '}
            {data.totalValor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
