import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const userRole = request.cookies.get('user_role')?.value;

  // Unauthenticated users attempting to access protected routes
  if (!userRole && (pathname.startsWith('/profile') || pathname.startsWith('/staff') || pathname.startsWith('/analytics'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Only Admin can open /analytics
  if (pathname.startsWith('/analytics') && userRole !== 'Admin') {
    return NextResponse.redirect(new URL('/parking', request.url));
  }

  // Staff and Admin can access staff incident operations
  if (pathname.startsWith('/staff') && userRole !== 'Staff' && userRole !== 'Admin') {
    return NextResponse.redirect(new URL('/parking', request.url));
  }

  // Prevent Staff and Admin from opening personal Customer profile
  if (pathname.startsWith('/profile') && userRole !== 'Customer') {
    const target = userRole === 'Admin' ? '/analytics' : '/staff/incidents';
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/analytics/:path*', '/staff/:path*', '/profile/:path*'],
};