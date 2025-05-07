// lib/log.ts
import { prisma } from './prisma'

export async function registrarLog(
  userId: string,
  acao: string,
  detalhes: string,
) {
  try {
    await prisma.log.create({
      data: { userId, acao, detalhes },
    })
  } catch (err) {
    console.error('Erro ao registrar log:', err)
  }
}
