import { NextResponse } from 'next/server'
import { withLogging } from '@/lib/api-handler'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

async function healthCheck() {
  try {
    // Teste de conectividade com o banco
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV
    })
  } catch (error) {
    return NextResponse.json({ 
      ok: false, 
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}

export const GET = withLogging(healthCheck)
