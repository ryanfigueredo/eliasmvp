import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sua lógica aqui
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
