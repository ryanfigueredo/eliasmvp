import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ message: 'ID do usuário inválido.' })
  }

  try {
    const [totalClientes, totalDocumentos, finalizados, clientes] =
      await Promise.all([
        prisma.cliente.count({ where: { userId } }),
        prisma.document.count({ where: { userId } }),
        prisma.document.count({
          where: { userId, status: 'FINALIZADO' },
        }),
        prisma.cliente.findMany({
          where: { userId },
          select: { valor: true },
        }),
      ])

    const totalValor = clientes.reduce((acc, c) => acc + c.valor, 0)

    return res.status(200).json({
      totalClientes,
      totalDocumentos,
      finalizados,
      totalValor,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erro ao buscar dados.' })
  }
}
