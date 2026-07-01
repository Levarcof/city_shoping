import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/login', '/register'];
  const isApiRoute = pathname.startsWith('/api');
  const isPublicAsset = pathname.startsWith('/_next') || pathname.startsWith('/leaflet') || pathname === '/favicon.ico';

  if (isApiRoute || isPublicAsset) return NextResponse.next();

  if (pathname === '/') {
    if (token) return NextResponse.redirect(new URL('/home', request.url));
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|leaflet).*)'],
};
