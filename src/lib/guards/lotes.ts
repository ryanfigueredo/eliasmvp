import { prisma } from '@/lib/prisma'

const isIniciado = (status?: string | null) => {
  if (!status) return false
  const s = status.toUpperCase().replace(/\s+/g, '_')
  return s === 'INICIADO'
}

/**
 * Lança erro se o lote NÃO puder receber novos documentos.
 * Permite quando não há loteId (comportamento atual).
 */
export async function assertLoteAceitaNovosDocs(loteId?: string | null) {
  if (!loteId) return

  const lote = await prisma.lote.findUnique({
    where: { id: loteId },
    select: { id: true, status: true },
  })

  if (!lote) {
    const err: any = new Error('Lote inválido.')
    err.statusCode = 400
    throw err
  }

  if (!isIniciado(lote.status)) {
    const err: any = new Error(
      'Este lote não aceita novos documentos (status diferente de INICIADO).'
    )
    err.statusCode = 403
    throw err
  }
}
