import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { DocumentoStatus, Orgao } from '@prisma/client'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()

  const { file, orgao, status, loteId } = req.query
  const role = req.headers['x-user-role']?.toString()
  const userId = req.headers['x-user-id']?.toString()

  let userIds: string[] = []

  if (role === 'master') {
    userIds = []
  } else if (role === 'admin') {
    const consultores = await prisma.user.findMany({
      where: { role: 'consultor', adminId: userId },
      select: { id: true },
    })
    userIds = [userId!, ...consultores.map((c) => c.id)]
  } else if (role === 'consultor') {
    userIds = [userId!]
  }

  try {
    const documentos = await prisma.document.findMany({
      where: {
        AND: [
          userIds.length > 0 ? { userId: { in: userIds } } : {},
          file
            ? {
                fileUrl: {
                  contains: file.toString(),
                  mode: 'insensitive',
                },
              }
            : {},
          orgao && Object.values(Orgao).includes(orgao as Orgao)
            ? { orgao: orgao as Orgao }
            : {},
          status &&
          Object.values(DocumentoStatus).includes(status as DocumentoStatus)
            ? { status: status as DocumentoStatus }
            : {},
          loteId ? { loteId: loteId.toString() } : {},
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            admin: {
              select: {
                name: true,
              },
            },
          },
        },
        cliente: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        lote: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(documentos)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao buscar documentos.' })
  }
}
