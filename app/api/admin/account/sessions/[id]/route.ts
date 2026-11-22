import { and, eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { adminRefreshTokens } from '@/server/db/schema';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { handleError, HttpError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic';
export async function DELETE(_: Request, { params }:{ params:{ id:string } }) { try { const admin = await requireAdmin(); const updated = await db.update(adminRefreshTokens).set({ revokedAt:new Date() }).where(and(eq(adminRefreshTokens.id, params.id), eq(adminRefreshTokens.adminId, admin.id))).returning({ id:adminRefreshTokens.id }); if (!updated[0]) throw new HttpError(404, 'Session not found'); return ok({ ok:true }); } catch(error) { return handleError(error); } }
