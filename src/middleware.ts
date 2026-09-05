import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'

const protectedRoutes = [
  '/dashboard',
  '/provider',
  '/admin',
]

const adminRoutes = ['/admin']
const providerRoutes = ['/provider']
const clientRoutes = ['/dashboard']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  if (!isProtected) {
    return NextResponse.next()
  }

  // Get access token from cookies
  const accessToken = request.cookies.get('access_token')?.value

  if (!accessToken) {
    // Redirect to login with redirect parameter
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify token
  const payload = await verifyAccessToken(accessToken)
  if (!payload) {
    // Try refresh token
    const refreshToken = request.cookies.get('refresh_token')?.value
    if (refreshToken) {
      // Let the client handle refresh via /api/auth/refresh
      const response = NextResponse.next()
      response.headers.set('x-token-expired', 'true')
      return response
    }
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access control
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isProviderRoute = providerRoutes.some(route => pathname.startsWith(route))
  const isClientRoute = clientRoutes.some(route => pathname.startsWith(route))

  if (isAdminRoute && payload.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  if (isProviderRoute && payload.role !== 'PROVIDER') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  if (isClientRoute && payload.role !== 'CLIENT') {
    return NextResponse.redirect(new URL('/provider/dashboard', request.url))
  }

  // Add user info to headers for server components
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)
  requestHeaders.set('x-user-role', payload.role)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/provider/:path*',
    '/admin/:path*',
  ],
}