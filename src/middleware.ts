import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'

// Public page routes that don't require authentication
const PUBLIC_PAGES = ['/', '/auth/signin', '/auth/signup', '/setup']

// Public API route prefixes
const PUBLIC_API_PREFIXES = ['/api/auth/', '/api/seed']

// --- START REFACTORED RBAC LOGIC ---

// Define role types for better type safety
type UserRole = 'super_admin' | 'restaurant_owner' | 'staff' | 'customer'

// Configuration for page route access control
const pageRouteRules: Record<string, UserRole[]> = {
  '/admin': ['super_admin'],
  '/owner': ['restaurant_owner'],
  '/staff': ['staff'],
  '/customer': ['customer'],
}

// Configuration for API route access control
const apiRouteRules: Record<string, UserRole[]> = {
  '/api/admin': ['super_admin'],
  '/api/owner': ['restaurant_owner'],
  '/api/staff': ['restaurant_owner', 'staff'],
  '/api/customer': ['customer'],
  '/api/menu-categories': ['restaurant_owner'],
  '/api/menu-items': ['restaurant_owner'],
}

// --- END REFACTORED RBAC LOGIC ---

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

  const role = token.role as UserRole

  // --- START REFACTORED RBAC CHECKS ---

  // Role-based access control for page routes
  for (const prefix in pageRouteRules) {
    if (pathname.startsWith(prefix)) {
      if (!pageRouteRules[prefix].includes(role)) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
      break // Match found, no need to check other rules
    }
  }

  // Role-based access control for API routes
  if (pathname.startsWith('/api/')) {
    for (const prefix in apiRouteRules) {
      if (pathname.startsWith(prefix)) {
        if (!apiRouteRules[prefix].includes(role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        break // Match found, no need to check other rules
      }
    }
  }
  
  // --- END REFACTORED RBAC CHECKS ---

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
