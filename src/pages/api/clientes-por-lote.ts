import { prisma } from '@/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const loteId = req.query.loteId?.toString()
  const role = req.headers['x-user-role']?.toString()
  const userId = req.headers['x-user-id']?.toString()

  if (!loteId || !role || !userId) {
    return res.status(400).json({ message: 'Parâmetros ausentes.' })
  }

  let userIds: string[] = []

  if (role === 'master') {
    userIds = [] // sem filtro
  } else if (role === 'admin') {
    const consultores = await prisma.user.findMany({
      where: { adminId: userId, role: 'consultor' },
      select: { id: true },
    })
    userIds = [userId, ...consultores.map((c) => c.id)]
  } else if (role === 'consultor') {
    userIds = [userId]
  }

  // Buscar os clienteId da tabela Document com o loteId
  const documentos = await prisma.document.findMany({
    where: {
      loteId,
      ...(userIds.length > 0 ? { userId: { in: userIds } } : {}),
    },
    select: { clienteId: true },
  })

  const clienteIds = documentos
    .map((doc) => doc.clienteId)
    .filter((id): id is string => Boolean(id)) // Remove nulls

  const clientes = await prisma.cliente.findMany({
    where: { id: { in: clienteIds } },
    include: { user: { select: { name: true } } },
  })

  return res.status(200).json(clientes)
}
