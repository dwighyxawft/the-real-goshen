import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from '@/server/db';
import { categories, products } from '@/server/db/schema';
import { getSettings } from '@/server/resources/settings/settings.service';
import { getRunningEvents } from '@/server/resources/discounts/discounts.service';
import { toProductDTO } from '@/server/resources/products/product.mapper';
import { handleError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export async function GET(_: Request, { params }:{ params:{ slug:string } }) { try { const base = (await db.select({ product:products, category:categories }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(eq(products.slug, params.slug)).limit(1))[0]; if (!base) return ok({ items:[] }); const rows = await db.select({ product:products, category:categories }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(and(eq(products.isPublished, true), ne(products.id, base.product.id), base.product.categoryId ? eq(products.categoryId, base.product.categoryId) : undefined)).orderBy(desc(products.createdAt)).limit(4); const settings = await getSettings(); const events = await getRunningEvents(); return ok({ items:rows.map((row) => toProductDTO(row.product, row.category, events, settings)) }); } catch (error) { return handleError(error); } }
