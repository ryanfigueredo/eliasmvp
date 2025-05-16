'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useSWR from 'swr'
import { Skeleton } from '@/components/ui/skeleton'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function DashboardStatsConsultor({
  userId,
}: {
  userId: string
}) {
  const { data, isLoading } = useSWR(
    `/api/stats/consultor?userId=${userId}`,
    fetcher,
  )

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{data.totalClientes}</p>
        </CardContent>
      </Card>

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
            R$ {data.totalValor.toFixed(2).replace('.', ',')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
