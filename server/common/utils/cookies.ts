import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

export const ACCESS_COOKIE = 'trg_access';
export const REFRESH_COOKIE = 'trg_refresh';
export function getAccessCookie(): string | undefined { return cookies().get(ACCESS_COOKIE)?.value; }
export function getRefreshCookie(): string | undefined { return cookies().get(REFRESH_COOKIE)?.value; }
export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): void { response.cookies.set(ACCESS_COOKIE, accessToken, { httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV === 'production', path:'/', maxAge:900 }); response.cookies.set(REFRESH_COOKIE, refreshToken, { httpOnly:true, sameSite:'strict', secure:process.env.NODE_ENV === 'production', path:'/api/admin/auth', maxAge:60 * 60 * 24 * 7 }); }
export function clearAuthCookies(response: NextResponse): void { response.cookies.set(ACCESS_COOKIE, '', { httpOnly:true, expires:new Date(0), path:'/' }); response.cookies.set(REFRESH_COOKIE, '', { httpOnly:true, expires:new Date(0), path:'/api/admin/auth' }); }
