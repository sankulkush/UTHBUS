// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // ── Internal task tracker ─────────────────────────────────────────────────
  // public/tracker.html holds internal sprint/BA notes — visible on dev and
  // preview deploys, 404'd on production so it never reaches uthbus.com.
  if (pathname === '/tracker.html' || pathname === '/tracker') {
    if (process.env.VERCEL_ENV === 'production') {
      return new NextResponse(null, { status: 404 })
    }
    if (pathname === '/tracker') {
      return NextResponse.rewrite(new URL('/tracker.html', request.url))
    }
    return NextResponse.next()
  }

  // ── Operator counter portal ───────────────────────────────────────────────
  if (pathname.startsWith('/operator/counter')) {
    if (!token) {
      const loginUrl = new URL('/operator/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Redirect already-authenticated operators away from login/register
  if (pathname === '/operator/login' || pathname === '/operator/register') {
    if (token) {
      const redirect = request.nextUrl.searchParams.get('redirect')
      const dest = redirect ? new URL(redirect, request.url) : new URL('/operator/counter', request.url)
      return NextResponse.redirect(dest)
    }
  }

  // ── Admin portal ──────────────────────────────────────────────────────────
  // Admin routes are client-side guarded by AdminAuthProvider.
  // Middleware just ensures the /admin root redirects to /admin/login when
  // there is no token, avoiding a flash of the spinner page.
  if (pathname === '/admin' || pathname.startsWith('/admin/buses')) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/operator/counter/:path*',
    '/operator/login',
    '/operator/register',
    '/admin',
    '/admin/buses/:path*',
    '/tracker',
    '/tracker.html',
  ]
}