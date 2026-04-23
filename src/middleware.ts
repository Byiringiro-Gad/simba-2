import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = req.cookies.get('admin_session')?.value;
    if (session !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Branch routes are protected client-side via localStorage token
  // (middleware can't read localStorage — protection is in the page components)

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
