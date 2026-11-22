import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { adminRefreshTokens, admins } from '@/server/db/schema';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { getRefreshCookie } from '@/server/common/utils/cookies';
import { verifyRefreshToken } from '@/server/common/utils/tokens';
import { hashPassword, validatePassword, verifyPassword } from '@/server/common/utils/password';
import { parseJson } from '@/server/common/utils/request';
import { handleError, HttpError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic';
const schema = z.object({ currentPassword:z.string().min(1), newPassword:z.string().min(1) });
export async function PATCH(req: Request) { try { const admin = await requireAdmin(); const body = await parseJson(req, schema); if (!await verifyPassword(body.currentPassword, admin.passwordHash)) throw new HttpError(401, 'Current password is incorrect.'); if (!validatePassword(body.newPassword)) throw new HttpError(422, 'Password must be at least 10 characters and include letters and numbers.'); await db.update(admins).set({ passwordHash:await hashPassword(body.newPassword) }).where(eq(admins.id, admin.id)); const current = getRefreshCookie(); const currentId = current ? (await verifyRefreshToken(current).catch(() => null))?.jti : null; if (currentId) await db.update(adminRefreshTokens).set({ revokedAt:new Date() }).where(and(eq(adminRefreshTokens.adminId, admin.id), ne(adminRefreshTokens.id, currentId))); return ok({ ok:true }); } catch(error) { return handleError(error); } }
