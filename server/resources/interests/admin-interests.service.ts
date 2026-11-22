import { and, desc, eq, isNull, lt, or, sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { interestItems, interestReminders, interests } from '@/server/db/schema';
import { getSettings } from '@/server/resources/settings/settings.service';
import { getPublicUrl } from '@/server/storage/r2';
import { formatLeadTime } from '@/server/common/utils/format';
import { sendEmailSafe } from '@/server/email';
import { interestReminder, interestCustomerConfirmation } from '@/server/common/email-templates';
import { buildInterestEmailData } from './interest-email';
import { env } from '@/server/common/utils/env';
import { HttpError } from '@/server/common/utils/http-error';

function toAdminItemDTO(item: typeof interestItems.$inferSelect) {
  return { ...item, imageUrl: item.productImageKey ? getPublicUrl(item.productImageKey) : null };
}

function toAdminInterestDTO(interest: typeof interests.$inferSelect, items: typeof interestItems.$inferSelect[], reminders: typeof interestReminders.$inferSelect[]) {
  const settings = { defaultLeadTimeWeeksMin: 4, defaultLeadTimeWeeksMax: 8, whatsappNumber: '', preorderNote: null as string | null };
  const hasPreorder = items.some((item) => item.availability === 'preorder');
  return {
    ...interest,
    items: items.map(toAdminItemDTO),
    reminders,
    hasPreorder,
  };
}

export async function listAdminInterests(input: { tab?: 'today' | 'past' | 'all'; status?: string; q?: string; page: number; limit: number }) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const rows = await db.select().from(interests).orderBy(desc(interests.createdAt));
  let items = rows;
  if (input.tab === 'today') items = rows.filter((row) => row.createdAt >= startOfToday);
  if (input.tab === 'past') items = rows.filter((row) => row.createdAt < startOfToday);
  if (input.status) items = items.filter((row) => row.status === input.status);
  if (input.q) {
    const q = input.q.toLowerCase();
    items = items.filter((row) => row.reference.toLowerCase().includes(q) || row.customerName.toLowerCase().includes(q) || row.customerEmail.toLowerCase().includes(q));
  }
  const total = items.length;
  const pageItems = items.slice((input.page - 1) * input.limit, input.page * input.limit);
  const todayCount = rows.filter((row) => row.createdAt >= startOfToday).length;
  const pastCount = rows.filter((row) => row.createdAt < startOfToday).length;
  return { items: pageItems, total, tabCounts: { today: todayCount, past: pastCount, all: rows.length } };
}

export async function getAdminInterest(id: string) {
  const interest = (await db.select().from(interests).where(eq(interests.id, id)).limit(1))[0];
  if (!interest) return null;
  const items = await db.select().from(interestItems).where(eq(interestItems.interestId, id));
  const reminders = await db.select().from(interestReminders).where(eq(interestReminders.interestId, id)).orderBy(desc(interestReminders.sentAt));
  return toAdminInterestDTO(interest, items, reminders);
}

export async function updateInterestStatus(id: string, status: string) {
  const valid = ['new', 'contacted', 'confirmed', 'completed', 'cancelled'];
  if (!valid.includes(status)) throw new HttpError(422, 'Invalid status');
  const set: Record<string, unknown> = { status };
  if (status === 'completed') set.completedAt = new Date();
  if (status !== 'completed') set.completedAt = null;
  const [updated] = await db.update(interests).set(set).where(eq(interests.id, id)).returning();
  if (!updated) return null;
  return getAdminInterest(id);
}

export async function bulkUpdateInterests(ids: string[], action: 'mark_done' | 'cancel' | 'delete') {
  if (action === 'delete') {
    let affected = 0;
    for (const id of ids) {
      const [deleted] = await db.delete(interests).where(eq(interests.id, id)).returning();
      if (deleted) affected += 1;
    }
    return { affected };
  }
  const status = action === 'mark_done' ? 'completed' : 'cancelled';
  const set: Record<string, unknown> = { status };
  if (action === 'mark_done') set.completedAt = new Date();
  let affected = 0;
  for (const id of ids) {
    const [updated] = await db.update(interests).set(set).where(eq(interests.id, id)).returning();
    if (updated) affected += 1;
  }
  return { affected };
}

export async function sendReminder(id: string, message?: string) {
  const interest = (await db.select().from(interests).where(eq(interests.id, id)).limit(1))[0];
  if (!interest) throw new HttpError(404, 'Interest not found');
  if (interest.status === 'completed' || interest.status === 'cancelled') throw new HttpError(422, 'This interest is already completed or cancelled.');
  if (interest.lastRemindedAt) {
    const hoursSince = (Date.now() - interest.lastRemindedAt.getTime()) / 3600000;
    if (hoursSince < 24) throw new HttpError(429, `A reminder was sent ${Math.ceil(24 - hoursSince)} hours ago. Please wait before sending another.`);
  }
  const settings = await getSettings();
  const items = await db.select().from(interestItems).where(eq(interestItems.interestId, id));
  const data = buildInterestEmailData(interest, items, settings);
  const sent = await sendEmailSafe({ ...interestReminder({ ...data, message }), to: interest.customerEmail, replyTo: env.STORE_NOTIFY_EMAIL });
  await db.insert(interestReminders).values({ interestId: id, message, success: sent });
  await db.update(interests).set({ lastRemindedAt: new Date(), reminderCount: interest.reminderCount + 1 }).where(eq(interests.id, id));
  return getAdminInterest(id);
}

export async function bulkRemindDryRun() {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 3600000);
  const rows = await db.select().from(interests).where(or(eq(interests.status, 'new'), eq(interests.status, 'contacted')));
  const canRemind = rows.filter((row) => !row.lastRemindedAt || row.lastRemindedAt < cutoff);
  const willSkip = rows.length - canRemind.length;
  return { canRemind: canRemind.length, willSkip, items: canRemind.map((row) => ({ id: row.id, reference: row.reference, customerName: row.customerName })) };
}

export async function bulkRemind(message?: string) {
  const dryRun = await bulkRemindDryRun();
  const sent: string[] = [];
  for (const item of dryRun.items) {
    try {
      await sendReminder(item.id, message);
      sent.push(item.id);
    } catch (error) {
      console.error('bulk remind failed for', item.id, error);
    }
  }
  return { sent: sent.length, total: dryRun.canRemind };
}

export async function resendConfirmation(id: string) {
  const interest = (await db.select().from(interests).where(eq(interests.id, id)).limit(1))[0];
  if (!interest) throw new HttpError(404, 'Interest not found');
  const settings = await getSettings();
  const items = await db.select().from(interestItems).where(eq(interestItems.interestId, id));
  const data = buildInterestEmailData(interest, items, settings);
  const sent = await sendEmailSafe({ ...interestCustomerConfirmation(data), to: interest.customerEmail });
  if (sent) await db.update(interests).set({ emailSentToCustomer: true }).where(eq(interests.id, id));
  return getAdminInterest(id);
}

export async function getStaleInterests() {
  const now = new Date();
  const stale = new Date(now.getTime() - 72 * 3600000);
  const rows = await db.select().from(interests).where(and(
    or(eq(interests.status, 'new'), eq(interests.status, 'contacted')),
    lt(interests.createdAt, stale),
    or(isNull(interests.lastRemindedAt), lt(interests.lastRemindedAt, new Date(now.getTime() - 48 * 3600000))),
  ));
  return { count: rows.length, items: rows.map((row) => ({ id: row.id, reference: row.reference, customerName: row.customerName })) };
}
