import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { adminRefreshTokens } from '@/server/db/schema';
import { clearAuthCookies, getRefreshCookie, setAuthCookies } from '@/server/common/utils/cookies';
import { hashToken, verifyRefreshToken } from '@/server/common/utils/tokens';
import { issueSession } from '@/server/resources/auth/session.service';
import { handleError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function rotate(req: Request) { const token = getRefreshCookie(); if (!token) throw new Error('Missing refresh token'); const claims = await verifyRefreshToken(token); const row = (await db.select().from(adminRefreshTokens).where(eq(adminRefreshTokens.id, claims.jti)).limit(1))[0]; if (!row || row.tokenHash !== hashToken(token) || row.expiresAt <= new Date()) throw new Error('Invalid refresh token'); if (row.revokedAt) { await db.update(adminRefreshTokens).set({ revokedAt:new Date() }).where(eq(adminRefreshTokens.adminId, row.adminId)); throw new Error('Refresh token reuse'); } const session = await issueSession(row.adminId, req); await db.update(adminRefreshTokens).set({ revokedAt:new Date(), replacedById:session.jti }).where(and(eq(adminRefreshTokens.id, row.id), isNull(adminRefreshTokens.revokedAt))); return session; }
export async function POST(req: Request) { try { const session = await rotate(req); const response = ok({ ok:true }); setAuthCookies(response, session.accessToken, session.refreshToken); return response; } catch { const response = ok({ message:'Not signed in' }, 401); clearAuthCookies(response); return response; } }
export async function GET(req: Request) { const next = new URL(req.url).searchParams.get('next'); const safeNext = next?.startsWith('/admin') ? next : '/admin'; try { const session = await rotate(req); const response = NextResponse.redirect(new URL(safeNext, new URL(req.url).origin)); response.headers.set('Cache-Control','no-store'); response.cookies.set('trg_access', session.accessToken, { httpOnly:true, sameSite:'lax', path:'/', maxAge:900 }); response.cookies.set('trg_refresh', session.refreshToken, { httpOnly:true, sameSite:'strict', path:'/api/admin/auth', maxAge:604800 }); return response; } catch { return Response.redirect(new URL(`/admin/login?next=${encodeURIComponent(safeNext)}`, new URL(req.url).origin)); } }
