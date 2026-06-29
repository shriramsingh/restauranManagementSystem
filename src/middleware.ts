import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

// Public page routes that don't require authentication
const PUBLIC_PAGES = ['/', '/auth/signin', '/auth/signup', '/setup']

// Public API route prefixes
const PUBLIC_API_PREFIXES = ['/api/auth/', '/api/seed']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public pages
  const isPublicPage = PUBLIC_PAGES.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  // Allow public API routes (auth callbacks, setup seeding)
  const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  // Allow Next.js static assets and image files
  const isStatic =
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|json)$/.test(pathname)

  if (isPublicPage || isPublicApi || isStatic) {
    return NextResponse.next()
  }

  // Verify JWT session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Not authenticated
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Role-based access control for page routes
  const role = token.role as string

  if (pathname.startsWith('/admin') && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  if (pathname.startsWith('/owner') && role !== 'restaurant_owner') {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  if (pathname.startsWith('/staff') && role !== 'staff') {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  if (pathname.startsWith('/customer') && role !== 'customer') {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Role-based access control for API routes
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/admin') && role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (
      pathname.startsWith('/api/owner') &&
      role !== 'restaurant_owner'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (
      pathname.startsWith('/api/staff') &&
      !['staff', 'restaurant_owner'].includes(role)
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (pathname.startsWith('/api/customer') && role !== 'customer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
