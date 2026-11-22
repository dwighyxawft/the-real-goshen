import { createHash } from 'node:crypto';
import { jwtVerify, SignJWT } from 'jose';
import { env } from './env';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
export type AccessClaims = { sub: string; type: 'access' };
export type RefreshClaims = { sub: string; jti: string; type: 'refresh' };
export async function signAccessToken(adminId: string): Promise<string> { return new SignJWT({ type:'access' }).setProtectedHeader({ alg:'HS256' }).setSubject(adminId).setIssuedAt().setExpirationTime(`${env.ACCESS_TOKEN_TTL_MINUTES}m`).sign(accessSecret); }
export async function signRefreshToken(adminId: string, jti: string): Promise<string> { return new SignJWT({ type:'refresh' }).setProtectedHeader({ alg:'HS256' }).setSubject(adminId).setJti(jti).setIssuedAt().setExpirationTime(`${env.REFRESH_TOKEN_TTL_DAYS}d`).sign(refreshSecret); }
export async function verifyAccessToken(token: string): Promise<AccessClaims> { const { payload } = await jwtVerify(token, accessSecret); if (payload.type !== 'access' || typeof payload.sub !== 'string') throw new Error('Invalid access token'); return { sub: payload.sub, type:'access' }; }
export async function verifyRefreshToken(token: string): Promise<RefreshClaims> { const { payload } = await jwtVerify(token, refreshSecret); if (payload.type !== 'refresh' || typeof payload.sub !== 'string' || typeof payload.jti !== 'string') throw new Error('Invalid refresh token'); return { sub: payload.sub, jti: payload.jti, type:'refresh' }; }
export function hashToken(token: string): string { return createHash('sha256').update(token).digest('hex'); }
