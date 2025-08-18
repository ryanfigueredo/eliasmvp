import logger from '@/lib/logger'

export function withLogging<T extends (...args: any[]) => Promise<Response>>(handler: T): T {
  return (async (...args: any[]) => {
    const req = args[0] as Request
    const start = Date.now()
    const requestId = req.headers.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const res = await handler(...args)
      const duration = Date.now() - start
      
      logger.info({ 
        requestId,
        path: new URL(req.url).pathname, 
        method: req.method,
        duration, 
        status: res.status,
        userAgent: req.headers.get('user-agent')?.substring(0, 100)
      })
      
      return res
    } catch (err: any) {
      const duration = Date.now() - start
      
      logger.error({ 
        requestId,
        err: err?.message, 
        stack: err?.stack, 
        path: new URL(req.url).pathname,
        method: req.method,
        duration
      })
      
      throw err
    }
  }) as T
}
