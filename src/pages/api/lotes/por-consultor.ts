import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'userId inválido' })
  }

  try {
    // Buscar os lotes que contenham documentos criados pelo consultor
    const documentos = await prisma.document.findMany({
      where: { userId },
      select: { loteId: true },
    })

    const loteIds = [
      ...new Set(documentos.map((d) => d.loteId).filter(Boolean)),
    ]

    if (loteIds.length === 0) {
      return res.status(200).json([])
    }

    const lotes = await prisma.lote.findMany({
      where: { id: { in: loteIds as string[] } },
      orderBy: { inicio: 'desc' },
      include: {
        documentos: {
          where: { userId }, // apenas os documentos do consultor
          select: { status: true },
        },
      },
    })

    const lotesComStatus = lotes.map((lote) => {
      const statusList = lote.documentos.map((doc) => doc.status)
      const statusSet = new Set(statusList)

      let status = 'Sem documentos'

      if (statusList.length > 0) {
        if (statusSet.has('EM_ANDAMENTO')) {
          status = 'Em andamento'
        } else if (statusSet.has('INICIADO')) {
          status = 'Iniciado'
        } else if (statusSet.has('FINALIZADO') && statusSet.size === 1) {
          status = 'Finalizado'
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
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erro ao buscar lotes.' })
  }
}
