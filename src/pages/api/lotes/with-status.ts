import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

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
      const statusSet = new Set(lote.documentos.map((doc) => doc.status))
      let status: string

      if (statusSet.has('EM_ANDAMENTO')) status = 'Em andamento'
      else if (statusSet.has('INICIADO')) status = 'Iniciado'
      else if (statusSet.has('FINALIZADO') && statusSet.size === 1)
        status = 'Finalizado'
      else status = 'Sem documentos'

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
