import { and, asc, desc, eq, inArray, ne } from 'drizzle-orm';
import { db } from '@/server/db';
import { categories, discountEvents, products } from '@/server/db/schema';
import { getSettings } from '@/server/resources/settings/settings.service';
import { getRunningEvents } from '@/server/resources/discounts/discounts.service';
import { toAdminProductDTO } from './product.mapper';
import { uniqueSlug } from '@/server/common/utils/slug';
import { deleteObjects } from '@/server/storage/r2';
import type { Product } from '@/server/db/schema';

export async function listAdminProducts(input: { q?: string; category?: string; availability?: 'preorder' | 'ready_stock'; published?: boolean; featured?: boolean; sort?: string; page: number; limit: number }) {
  const settings = await getSettings();
  const events = await getRunningEvents();
  const rows = await db.select({ product: products, category: categories }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).orderBy(desc(products.createdAt));
  let items = rows.filter(({ product, category }) =>
    (!input.q || product.name.toLowerCase().includes(input.q.toLowerCase())) &&
    (!input.category || category?.slug === input.category) &&
    (!input.availability || product.availability === input.availability) &&
    (input.published === undefined || product.isPublished === input.published) &&
    (!input.featured || product.isFeatured),
  );
  if (input.sort === 'price_asc') items = [...items].sort((a, b) => a.product.price - b.product.price);
  if (input.sort === 'price_desc') items = [...items].sort((a, b) => b.product.price - a.product.price);
  if (input.sort === 'oldest') items = [...items].reverse();
  const total = items.length;
  const pageItems = items.slice((input.page - 1) * input.limit, input.page * input.limit).map(({ product, category }) => toAdminProductDTO(product, category, events, settings));
  return { items: pageItems, total };
}

export async function getAdminProduct(id: string) {
  const settings = await getSettings();
  const events = await getRunningEvents();
  const row = (await db.select({ product: products, category: categories }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(eq(products.id, id)).limit(1))[0];
  return row ? toAdminProductDTO(row.product, row.category, events, settings) : null;
}

export async function createProduct(input: { name: string; description?: string; price: number; categoryId?: string | null; images?: string[]; availability?: 'preorder' | 'ready_stock'; leadTimeWeeksMin?: number | null; leadTimeWeeksMax?: number | null; stockStatus?: 'in_stock' | 'limited' | 'out_of_stock'; isPublished?: boolean; isFeatured?: boolean }) {
  const slug = await uniqueSlug(input.name, 'products');
  const [created] = await db.insert(products).values({
    name: input.name,
    slug,
    description: input.description ?? '',
    price: input.price,
    categoryId: input.categoryId ?? null,
    images: input.images ?? [],
    availability: input.availability ?? 'preorder',
    leadTimeWeeksMin: input.leadTimeWeeksMin ?? null,
    leadTimeWeeksMax: input.leadTimeWeeksMax ?? null,
    stockStatus: input.stockStatus ?? 'in_stock',
    isPublished: input.isPublished ?? false,
    isFeatured: input.isFeatured ?? false,
  }).returning();
  return getAdminProduct(created.id);
}

export async function updateProduct(id: string, input: Partial<{ name: string; description: string; price: number; categoryId: string | null; images: string[]; availability: 'preorder' | 'ready_stock'; leadTimeWeeksMin: number | null; leadTimeWeeksMax: number | null; stockStatus: 'in_stock' | 'limited' | 'out_of_stock'; isPublished: boolean; isFeatured: boolean }>) {
  const current = (await db.select().from(products).where(eq(products.id, id)).limit(1))[0];
  if (!current) return null;
  const set: Record<string, unknown> = { ...input };
  if (input.name && input.name !== current.name) set.slug = await uniqueSlug(input.name, 'products', id);
  const [updated] = await db.update(products).set(set).where(eq(products.id, id)).returning();
  const removed = current.images.filter((key) => !(input.images ?? current.images).includes(key));
  if (removed.length) { try { await deleteObjects(removed); } catch (error) { console.error('product image cleanup failed', error); } }
  return getAdminProduct(updated.id);
}

export async function deleteProduct(id: string) {
  const product = (await db.select().from(products).where(eq(products.id, id)).limit(1))[0];
  if (!product) return null;
  await db.delete(products).where(eq(products.id, id));
  if (product.images.length) { try { await deleteObjects(product.images); } catch (error) { console.error('product image cleanup failed', error); } }
  return { id };
}

export async function setPublished(id: string, isPublished: boolean) {
  const [updated] = await db.update(products).set({ isPublished }).where(eq(products.id, id)).returning();
  if (!updated) return null;
  return getAdminProduct(id);
}

export async function duplicateProduct(id: string) {
  const source = (await db.select().from(products).where(eq(products.id, id)).limit(1))[0] as Product | undefined;
  if (!source) return null;
  const slug = await uniqueSlug(`${source.name} copy`, 'products');
  const [created] = await db.insert(products).values({
    name: `${source.name} (copy)`,
    slug,
    description: source.description,
    price: source.price,
    categoryId: source.categoryId,
    images: source.images,
    availability: source.availability,
    leadTimeWeeksMin: source.leadTimeWeeksMin,
    leadTimeWeeksMax: source.leadTimeWeeksMax,
    stockStatus: source.stockStatus,
    isPublished: false,
    isFeatured: false,
  }).returning();
  return getAdminProduct(created.id);
}

export async function bulkUpdateProducts(ids: string[], action: 'publish' | 'unpublish' | 'feature' | 'unfeature' | 'delete') {
  if (action === 'delete') {
    const rows = await db.select().from(products).where(inArray(products.id, ids));
    await db.delete(products).where(inArray(products.id, ids));
    const allImages = rows.flatMap((row) => row.images);
    if (allImages.length) { try { await deleteObjects(allImages); } catch (error) { console.error('bulk image cleanup failed', error); } }
    return { affected: rows.length };
  }
  const set: Record<string, unknown> = {};
  if (action === 'publish') set.isPublished = true;
  if (action === 'unpublish') set.isPublished = false;
  if (action === 'feature') set.isFeatured = true;
  if (action === 'unfeature') set.isFeatured = false;
  let affected = 0;
  for (const productId of ids) {
    const [updated] = await db.update(products).set(set).where(eq(products.id, productId)).returning();
    if (updated) affected += 1;
  }
  return { affected };
}
