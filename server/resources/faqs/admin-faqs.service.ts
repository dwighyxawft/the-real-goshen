import { asc, desc, eq, max } from 'drizzle-orm';
import { db } from '@/server/db';
import { faqs } from '@/server/db/schema';

export async function listAdminFaqs() {
  return db.select().from(faqs).orderBy(asc(faqs.sortOrder));
}

export async function createFaq(input: { question: string; answer: string; isPublished?: boolean }) {
  const [{ value }] = await db.select({ value: max(faqs.sortOrder) }).from(faqs);
  const [created] = await db.insert(faqs).values({
    question: input.question,
    answer: input.answer,
    isPublished: input.isPublished ?? true,
    sortOrder: (value ?? -1) + 1,
  }).returning();
  return created;
}

export async function updateFaq(id: string, input: Partial<{ question: string; answer: string; isPublished: boolean }>) {
  const [updated] = await db.update(faqs).set(input).where(eq(faqs.id, id)).returning();
  return updated ?? null;
}

export async function deleteFaq(id: string) {
  const [deleted] = await db.delete(faqs).where(eq(faqs.id, id)).returning();
  return deleted ? { id } : null;
}

export async function reorderFaqs(ids: string[]) {
  for (let i = 0; i < ids.length; i += 1) {
    await db.update(faqs).set({ sortOrder: i }).where(eq(faqs.id, ids[i]));
  }
}
