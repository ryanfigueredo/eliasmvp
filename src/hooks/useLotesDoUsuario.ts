'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useLotesDoUsuario(userId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/lotes/por-consultor?userId=${userId}`,
    fetcher,
  )

  return {
    lotes: data || [],
    isLoading,
    error,
  }
}
