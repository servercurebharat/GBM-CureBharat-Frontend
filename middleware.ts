import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/otp-verify', '/buy'];

// Routes accessible to ANY logged-in user regardless of role
const SHARED_ROUTES = ['/payment'];

const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin',
  sh: '/sh',
  hba: '/hba',
  hcm: '/hcm',
  hcc: '/hcc',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Allow static public assets (images, icons, etc.) to bypass auth checks
  if (/\.(png|jpg|jpeg|svg|gif|webp|ico|txt|json)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // 1. Allow public routes — NEVER force-redirect on /login refresh
  // Users should be able to visit /login even if logged in (to switch accounts).
  // The login page itself handles redirection after successful login.
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // 2. Allow shared routes for any authenticated user (e.g. /payment/status)
  if (SHARED_ROUTES.some(r => pathname.startsWith(r))) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.next();
  }

  // 3. Protect all other routes (Dashboard routes)
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Role-based route protection
  if (userRole) {
    const allowedBase = ROLE_ROUTES[userRole];
    
    if (!allowedBase) {
      // Invalid role in cookie, clear it by forcing a new login
      const res = NextResponse.redirect(new URL('/login', request.url));
      res.cookies.delete('auth_token');
      res.cookies.delete('user_role');
      return res;
    }

    const isAccessingRoot = pathname === '/';
    
    // Check if user is trying to access a different role's dashboard
    const isWrongDashboard = Object.values(ROLE_ROUTES).some(
      route => pathname.startsWith(route) && route !== allowedBase
    );

    if (isAccessingRoot) {
      return NextResponse.redirect(new URL(allowedBase, request.url));
    }

    if (isWrongDashboard) {
      // Redirect back to their assigned dashboard
      return NextResponse.redirect(new URL(allowedBase, request.url));
    }
  } else {
    // If token exists but no role cookie, force login to re-establish session
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
