import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const adminsRaw = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { id: true, name: true },
  })

  const consultoresRaw = await prisma.user.findMany({
    where: { role: 'consultor' },
    select: { id: true, name: true },
  })

  return NextResponse.json({
    admins: adminsRaw.map((a) => ({ id: a.id, name: a.name ?? '' })),
    consultores: consultoresRaw.map((c) => ({ id: c.id, name: c.name ?? '' })),
  })
}
