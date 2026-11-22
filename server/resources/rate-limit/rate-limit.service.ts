import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { rateLimits } from '@/server/db/schema';
import { HttpError } from '@/server/common/utils/http-error';

export async function rateLimit(key: string, max: number, windowSeconds: number) { const now = new Date(); const result = await db.insert(rateLimits).values({ key, count:1, windowStart:now }).onConflictDoUpdate({ target:rateLimits.key, set:{ count:sql`CASE WHEN ${rateLimits.windowStart} <= now() - (${windowSeconds} * interval '1 second') THEN 1 ELSE ${rateLimits.count} + 1 END`, windowStart:sql`CASE WHEN ${rateLimits.windowStart} <= now() - (${windowSeconds} * interval '1 second') THEN now() ELSE ${rateLimits.windowStart} END` } }).returning({ count:rateLimits.count, windowStart:rateLimits.windowStart }); const row = result[0]; const retryAfterSeconds = Math.max(1, windowSeconds - Math.floor((Date.now() - row.windowStart.getTime()) / 1000)); const allowed = row.count <= max; return { allowed, remaining:Math.max(0, max - row.count), retryAfterSeconds }; }
export async function enforceRateLimit(key: string, max: number, windowSeconds: number): Promise<void> { const result = await rateLimit(key, max, windowSeconds); if (!result.allowed) throw new HttpError(429, 'Too many attempts. Please try again later.', { retryAfterSeconds:result.retryAfterSeconds }); }
export async function resetRateLimit(key: string): Promise<void> { await db.delete(rateLimits).where(eq(rateLimits.key, key)); }
