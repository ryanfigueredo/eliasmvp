import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query

  if (req.method === 'PATCH') {
    const { status } = req.body

    await prisma.lote.update({
      where: { id: String(id) },
      data: { status },
    })

    return res.status(200).json({ ok: true })
  }

  return res.status(405).end()
}
