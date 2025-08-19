import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { Parser } from 'json2csv'

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
    userIds = []
  } else if (role === 'admin') {
    const consultores = await prisma.user.findMany({
      where: { role: 'consultor', adminId: userId },
      select: { id: true },
    })
    userIds = [userId, ...consultores.map((c) => c.id)]
  } else {
    userIds = [userId]
  }

  // Busca os documentos com o lote desejado
  const documentos = await prisma.document.findMany({
    where: {
      loteId,
      AND: userIds.length > 0 ? { userId: { in: userIds } } : {},
    },
    select: {
      clienteId: true,
      user: { select: { name: true } },
      orgao: true,
      status: true,
      createdAt: true,
    },
  })

  const clienteIds = documentos
    .map((doc) => doc.clienteId)
    .filter((id): id is string => !!id)

  const clientes = await prisma.cliente.findMany({
    where: {
      id: { in: clienteIds },
      ...(userIds.length > 0 ? { userId: { in: userIds } } : {}),
    },
  })

  const clientesMap = Object.fromEntries(clientes.map((c) => [c.id, c]))

  const dataCsv = documentos.map((doc) => {
    const cliente = doc.clienteId ? clientesMap[doc.clienteId] : null
    return {
      nome: cliente?.nome || '',
      cpfCnpj: cliente?.cpfCnpj || '',
      valor: cliente ? `R$ ${cliente.valor.toFixed(2)}` : '',
      responsavel: doc.user?.name || '',
      orgao: doc.orgao,
      status: doc.status,
      criadoEm: doc.createdAt.toLocaleDateString('pt-BR'),
    }
  })

  const parser = new Parser({ delimiter: ';' })
  const csv = parser.parse(dataCsv)

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=clientes-lote-${loteId}.csv`,
  )
  res.status(200).send(csv)
}
