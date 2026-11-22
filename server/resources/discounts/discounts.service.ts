import { and, eq, gte, lt } from 'drizzle-orm';
import { db } from '@/server/db';
import { discountEvents } from '@/server/db/schema';
export async function getRunningEvents(now = new Date()) { return db.select().from(discountEvents).where(and(eq(discountEvents.isActive, true), lt(discountEvents.startsAt, now), gte(discountEvents.endsAt, now))); }
export function getDiscountState(event: { isActive: boolean; startsAt: Date; endsAt: Date }, now = new Date()) { if (!event.isActive) return 'disabled'; if (event.startsAt > now) return 'scheduled'; if (event.endsAt <= now) return 'ended'; return 'running'; }
