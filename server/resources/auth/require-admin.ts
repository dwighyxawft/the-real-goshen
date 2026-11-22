import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { admins } from '@/server/db/schema';
import { getAccessCookie } from '@/server/common/utils/cookies';
import { verifyAccessToken } from '@/server/common/utils/tokens';
import { HttpError } from '@/server/common/utils/http-error';
export async function requireAdmin() { const token = getAccessCookie(); if (!token) throw new HttpError(401, 'Not signed in'); try { const claims = await verifyAccessToken(token); const admin = (await db.select().from(admins).where(eq(admins.id, claims.sub)).limit(1))[0]; if (!admin) throw new Error('Missing admin'); return admin; } catch { throw new HttpError(401, 'Not signed in'); } }
