import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { adminRefreshTokens } from '@/server/db/schema';
import { clearAuthCookies } from '@/server/common/utils/cookies';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { handleError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST() { try { const admin = await requireAdmin(); await db.update(adminRefreshTokens).set({ revokedAt:new Date() }).where(eq(adminRefreshTokens.adminId, admin.id)); const response = ok({ ok:true }); clearAuthCookies(response); return response; } catch (error) { return handleError(error); } }
