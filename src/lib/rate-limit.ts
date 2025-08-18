import LRU from 'lru-cache'

const hits = new LRU<string, { count: number; resetAt: number }>({ 
  max: 5000,
  ttl: 1000 * 60 * 5, // 5 minutos
})

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now()
  const rec = hits.get(key)
  
  if (!rec || rec.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  
  rec.count++
  if (rec.count > limit) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((rec.resetAt - now) / 1000),
      remaining: 0
    }
  }
  
  return { allowed: true, remaining: limit - rec.count }
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  const realIP = req.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}
