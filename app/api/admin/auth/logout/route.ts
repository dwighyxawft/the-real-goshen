import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { adminRefreshTokens } from '@/server/db/schema';
import { clearAuthCookies, getRefreshCookie } from '@/server/common/utils/cookies';
import { verifyRefreshToken } from '@/server/common/utils/tokens';
import { handleError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST() { const response = ok({ ok:true }); try { const token = getRefreshCookie(); if (token) { const claims = await verifyRefreshToken(token); await db.update(adminRefreshTokens).set({ revokedAt:new Date() }).where(eq(adminRefreshTokens.id, claims.jti)); } } catch { /* logout is intentionally idempotent */ } clearAuthCookies(response); return response; }
