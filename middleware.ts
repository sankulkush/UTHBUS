// middleware.ts (in the root of your project)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the route is protected (operator counter routes)
  if (pathname.startsWith('/operator/counter')) {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/operator/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Token exists, allow the request to proceed
    return NextResponse.next()
  }
  
  // For login and register pages, redirect to counter if already authenticated
  if (pathname === '/operator/login' || pathname === '/operator/register') {
    const token = request.cookies.get('auth-token')?.value
    
    if (token) {
      // Check if there's a redirect parameter
      const redirect = request.nextUrl.searchParams.get('redirect')
      const redirectUrl = redirect ? new URL(redirect, request.url) : new URL('/operator/counter', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/operator/counter/:path*',
    '/operator/login',
    '/operator/register'
  ]
}