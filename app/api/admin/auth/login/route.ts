import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { admins } from '@/server/db/schema';
import { parseJson, getClientIp } from '@/server/common/utils/request';
import { enforceRateLimit, resetRateLimit } from '@/server/resources/rate-limit/rate-limit.service';
import { verifyPassword } from '@/server/common/utils/password';
import { issueSession } from '@/server/resources/auth/session.service';
import { setAuthCookies } from '@/server/common/utils/cookies';
import { handleError, HttpError, ok } from '@/server/common/utils/api-response';
import bcrypt from 'bcryptjs';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const schema = z.object({ email:z.string().trim().email().transform((value) => value.toLowerCase()), password:z.string().min(1) });
const dummyHash = '$2b$12$C6UzMDM.H6dfI/f/IKcEeOq2wNw5f7f9k8jLwWqR6oY0M2q8gS4yK';
export async function POST(req: Request) { try { const body = await parseJson(req, schema); const ip = getClientIp(req); const admin = (await db.select().from(admins).where(eq(admins.email, body.email)).limit(1))[0]; const valid = admin ? await verifyPassword(body.password, admin.passwordHash) : await bcrypt.compare(body.password, dummyHash); if (!valid || !admin) { await enforceRateLimit(`login:${ip}`, 5, 900); throw new HttpError(401, 'Email or password is incorrect'); } await resetRateLimit(`login:${ip}`); const session = await issueSession(admin.id, req); const response = ok({ admin:{ id:admin.id, name:admin.name, email:admin.email } }); setAuthCookies(response, session.accessToken, session.refreshToken); return response; } catch (error) { return handleError(error); } }
