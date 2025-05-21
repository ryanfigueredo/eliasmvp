import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const protectedRoutes: Record<string, string[]> = {
  '/dashboard/master': ['master'],
  '/dashboard/admin': ['admin', 'master'],
  '/dashboard/consultor': ['consultor', 'admin', 'master'],
  '/usuarios': ['admin', 'master'],
  '/logs': ['master'],
  '/clientes': ['consultor', 'admin', 'master'],
  '/documentos': ['consultor', 'admin', 'master'],
}

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

  const role = token.role as string

  const rolePaths: Record<string, string> = {
    master: '/dashboard/master',
    admin: '/dashboard/admin',
    consultor: '/dashboard/consultor',
    'white-label': '/dashboard/white-label',
  }

  // Verificar permissões de rota
  for (const [path, roles] of Object.entries(protectedRoutes)) {
    if (
      pathname.startsWith(path) &&
      !(typeof role === 'string' && roles.includes(role))
    ) {
      const redirectPath = rolePaths[role] || '/dashboard'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/usuarios',
    '/logs',
    '/clientes',
    '/documentos',
    '/white-label',
  ],
}
