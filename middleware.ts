import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/otp-verify'];

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

  // 1. Allow public routes — NEVER force-redirect on /login refresh
  // Users should be able to visit /login even if logged in (to switch accounts).
  // The login page itself handles redirection after successful login.
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // 2. Protect all other routes (Dashboard routes)
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Role-based route protection
  if (userRole) {
    const allowedBase = ROLE_ROUTES[userRole];
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
