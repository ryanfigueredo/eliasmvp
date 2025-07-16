import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const emailMaster = 'master@elias.com'

  const master = await prisma.user.findUnique({
    where: { email: emailMaster },
    select: { id: true },
  })

  if (!master) {
    return NextResponse.json(
      { message: 'Master não encontrado' },
      { status: 404 },
    )
  }

  const ownerId = master.id

  // Atualiza users criados por esse master
  await prisma.user.updateMany({
    where: { role: { in: ['admin', 'consultor'] }, adminId: undefined },
    data: { ownerId },
  })

  // Atualiza clientes criados por esse master
  await prisma.cliente.updateMany({
    where: { ownerId: null },
    data: { ownerId },
  })

  // Atualiza documentos
  await prisma.document.updateMany({
    where: { ownerId: null },
    data: { ownerId },
  })

  // Atualiza lotes
  await prisma.lote.updateMany({
    where: { ownerId: null },
    data: { ownerId },
  })

  return NextResponse.json({ message: 'Dados corrigidos com sucesso' })
}
