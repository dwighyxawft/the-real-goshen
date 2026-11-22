import { and, eq, gt, isNull, desc } from 'drizzle-orm';
import { db } from '@/server/db';
import { adminRefreshTokens } from '@/server/db/schema';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { getRefreshCookie } from '@/server/common/utils/cookies';
import { verifyRefreshToken } from '@/server/common/utils/tokens';
import { handleError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic';
export async function GET() { try { const admin = await requireAdmin(); const current = getRefreshCookie(); const jti = current ? (await verifyRefreshToken(current).catch(() => null))?.jti : null; const items = await db.select({ id:adminRefreshTokens.id, userAgent:adminRefreshTokens.userAgent, ip:adminRefreshTokens.ip, createdAt:adminRefreshTokens.createdAt, expiresAt:adminRefreshTokens.expiresAt }).from(adminRefreshTokens).where(and(eq(adminRefreshTokens.adminId, admin.id), isNull(adminRefreshTokens.revokedAt), gt(adminRefreshTokens.expiresAt, new Date()))).orderBy(desc(adminRefreshTokens.createdAt)); return ok({ items:items.map((item) => ({ ...item, isCurrent:item.id === jti })) }); } catch(error) { return handleError(error); } }
