import { and, desc, eq, lt, gte } from 'drizzle-orm';
import { db } from '@/server/db';
import { discountEvents, products } from '@/server/db/schema';
import { getDiscountState } from '@/server/resources/discounts/discounts.service';
import { getPublicUrl } from '@/server/storage/r2';
import { HttpError } from '@/server/common/utils/http-error';

export async function listAdminDiscounts() {
  const rows = await db.select({ event: discountEvents, product: products }).from(discountEvents).leftJoin(products, eq(discountEvents.productId, products.id)).orderBy(desc(discountEvents.createdAt));
  return rows.map(({ event, product }) => ({
    ...event,
    state: getDiscountState(event),
    product: product ? { id: product.id, name: product.name, slug: product.slug } : null,
  }));
}

export async function createDiscount(input: { name: string; scope: 'all' | 'product'; productId?: string | null; percentage: number; startsAt: string; endsAt: string; isActive?: boolean }) {
  if (input.scope === 'product' && !input.productId) throw new HttpError(422, 'Product-scoped discounts need a product');
  if (input.scope === 'all' && input.productId) throw new HttpError(422, 'Store-wide discounts cannot target a product');
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);
  if (endsAt <= startsAt) throw new HttpError(422, 'End date must be after start date');
  const [created] = await db.insert(discountEvents).values({
    name: input.name,
    scope: input.scope,
    productId: input.scope === 'product' ? input.productId! : null,
    percentage: input.percentage,
    startsAt,
    endsAt,
    isActive: input.isActive ?? true,
  }).returning();
  return created;
}

export async function updateDiscount(id: string, input: Partial<{ name: string; scope: 'all' | 'product'; productId: string | null; percentage: number; startsAt: string; endsAt: string; isActive: boolean }>) {
  const current = (await db.select().from(discountEvents).where(eq(discountEvents.id, id)).limit(1))[0];
  if (!current) return null;
  const set: Record<string, unknown> = {};
  if (input.name !== undefined) set.name = input.name;
  if (input.scope !== undefined) set.scope = input.scope;
  if (input.productId !== undefined) set.productId = input.scope === 'product' ? input.productId : null;
  if (input.percentage !== undefined) set.percentage = input.percentage;
  if (input.startsAt !== undefined) set.startsAt = new Date(input.startsAt);
  if (input.endsAt !== undefined) set.endsAt = new Date(input.endsAt);
  if (input.isActive !== undefined) set.isActive = input.isActive;
  if (set.startsAt && set.endsAt && new Date(set.endsAt as string) <= new Date(set.startsAt as string)) throw new HttpError(422, 'End date must be after start date');
  const [updated] = await db.update(discountEvents).set(set).where(eq(discountEvents.id, id)).returning();
  return updated;
}

export async function toggleDiscount(id: string) {
  const current = (await db.select().from(discountEvents).where(eq(discountEvents.id, id)).limit(1))[0];
  if (!current) return null;
  const [updated] = await db.update(discountEvents).set({ isActive: !current.isActive }).where(eq(discountEvents.id, id)).returning();
  return updated;
}

export async function deleteDiscount(id: string) {
  const [deleted] = await db.delete(discountEvents).where(eq(discountEvents.id, id)).returning();
  if (!deleted) return null;
  return { id };
}
