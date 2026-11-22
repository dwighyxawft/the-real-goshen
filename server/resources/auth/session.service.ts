import { randomUUID } from 'node:crypto';
import { db } from '@/server/db';
import { adminRefreshTokens } from '@/server/db/schema';
import { env } from '@/server/common/utils/env';
import { getClientIp } from '@/server/common/utils/request';
import { hashToken, signAccessToken, signRefreshToken } from '@/server/common/utils/tokens';
export async function issueSession(adminId: string, req: Request) { const jti = randomUUID(); const refreshToken = await signRefreshToken(adminId, jti); const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000); await db.insert(adminRefreshTokens).values({ id:jti, adminId, tokenHash:hashToken(refreshToken), expiresAt, userAgent:req.headers.get('user-agent'), ip:getClientIp(req) }); return { accessToken:await signAccessToken(adminId), refreshToken, jti, expiresAt }; }
