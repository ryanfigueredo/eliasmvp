import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'
import { DocumentoStatus } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const lotes = await prisma.lote.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        documentos: {
          select: { status: true },
        },
      },
    })

    const lotesComStatus = lotes.map((lote) => {
      const statusList = lote.documentos.map((doc) => doc.status)
      const total = statusList.length

      let status: string = 'Sem documentos'

      if (total > 0) {
        const count: Record<DocumentoStatus, number> = {
          INICIADO: 0,
          EM_ANDAMENTO: 0,
          FINALIZADO: 0,
        }

        for (const s of statusList) {
          if (s in count) {
            count[s as DocumentoStatus] += 1
          }
        }

        if (count.FINALIZADO === total) {
          status = 'Finalizado'
        } else if (count.EM_ANDAMENTO > 0) {
          status = 'Em andamento'
        } else if (count.INICIADO > 0) {
          status = 'Iniciado'
        } else {
          status = 'Desconhecido'
        }
      }

      return {
        id: lote.id,
        nome: lote.nome,
        inicio: lote.inicio,
        fim: lote.fim,
        status,
      }
    })

    return res.status(200).json(lotesComStatus)
  } catch (error) {
    console.error('[lotes/with-status] erro:', error)
    return res.status(500).json({ message: 'Erro ao buscar lotes.' })
  }
}
