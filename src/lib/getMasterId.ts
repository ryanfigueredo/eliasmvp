import { prisma } from '@/lib/prisma'

export async function getMasterId(userId: string): Promise<string | null> {
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, ownerId: true },
  })

  if (!user) return null

  return user.role === 'master' ? userId : user.ownerId || null
}
