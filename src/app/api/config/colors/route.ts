import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMasterId } from '@/lib/getMasterId'

// Save/update brand colors for a given user (Master)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, primaryColor, textColor, sidebarBg } = body || {}

    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })
    }

    const config = await prisma.config.upsert({
      where: { userId },
      update: {
        primaryColor: primaryColor ?? undefined,
        textColor: textColor ?? undefined,
        sidebarBg: sidebarBg ?? undefined,
      },
      create: {
        userId,
        primaryColor: primaryColor ?? null,
        textColor: textColor ?? null,
        sidebarBg: sidebarBg ?? null,
      },
    })

    return NextResponse.json({ config })
  } catch (err) {
    console.error('[config.colors][POST] error', err)
    return NextResponse.json({ error: 'Erro ao salvar cores' }, { status: 500 })
  }
}

// Resolve colors for any user: returns the master's colors if available
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })
    }

    const masterId = await getMasterId(userId)
    const ownerId = masterId || userId

    const config = await prisma.config.findUnique({
      where: { userId: ownerId },
      select: { primaryColor: true, textColor: true, sidebarBg: true },
    })

    return NextResponse.json({
      primaryColor: config?.primaryColor ?? null,
      textColor: config?.textColor ?? null,
      sidebarBg: config?.sidebarBg ?? null,
    })
  } catch (err) {
    console.error('[config.colors][GET] error', err)
    return NextResponse.json({ error: 'Erro ao buscar cores' }, { status: 500 })
  }
}


