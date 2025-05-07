import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Liberar rotas públicas
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Redirecionar se não estiver autenticado
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Proteção por cargo
  const role = token.role
  const rolePaths: Record<string, string> = {
    master: '/dashboard/master',
    admin: '/dashboard/admin',
    'white-label': '/dashboard/white-label',
    consultor: '/dashboard/consultor',
  }

  for (const [key, path] of Object.entries(rolePaths)) {
    if (pathname.startsWith(path) && role !== key) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
