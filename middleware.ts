import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ACCESS_COOKIE = 'trg_access';
const REFRESH_COOKIE = 'trg_refresh';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/admin') || pathname === '/admin/login' || pathname === '/admin/setup') {
    return NextResponse.next();
  }

  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  if (access) {
    return NextResponse.next();
  }

  if (refresh) {
    const next = encodeURIComponent(pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(`/api/admin/auth/refresh?next=${next}`, req.url));
  }

  const next = encodeURIComponent(pathname + req.nextUrl.search);
  return NextResponse.redirect(new URL(`/admin/login?next=${next}`, req.url));
}

export const config = {
  matcher: ['/admin/:path*'],
};
