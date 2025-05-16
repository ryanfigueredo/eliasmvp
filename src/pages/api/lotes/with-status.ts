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
      orderBy: { inicio: 'desc' },
      include: {
        documentos: {
          select: {
            status: true,
          },
        },
      },
    })

    const lotesComStatus = lotes.map((lote) => {
      const statusList = lote.documentos.map((doc) => doc.status)

      let status: string = 'Sem documentos'
      const total = statusList.length

      const finalizados = statusList.filter((s) => s === 'FINALIZADO').length
      const emAndamento = statusList.includes('EM_ANDAMENTO')
      const iniciados = statusList.includes('INICIADO')

      if (total > 0) {
        if (finalizados === total) {
          status = 'Finalizado'
        } else if (emAndamento) {
          status = 'Em andamento'
        } else if (iniciados) {
          status = 'Iniciado'
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
    console.error(error)
    return res.status(500).json({ message: 'Erro ao buscar lotes.' })
  }
}
