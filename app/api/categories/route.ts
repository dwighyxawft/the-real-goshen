import { count, eq, asc } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { categories, products } from '@/server/db/schema';
import { getPublicUrl } from '@/server/storage/r2';
import { handleError, ok, withCache } from '@/server/common/utils/api-response';
import { parseQuery } from '@/server/common/utils/request';
export const runtime = 'nodejs';
const querySchema = z.object({ nonEmpty:z.string().optional() });
export async function GET(req: Request) { try { const query = parseQuery(req.url, querySchema); const rows = await db.select({ id:categories.id, name:categories.name, slug:categories.slug, imageKey:categories.imageKey, productCount:count(products.id) }).from(categories).leftJoin(products, eq(products.categoryId, categories.id)).where(query.nonEmpty ? eq(products.isPublished, true) : undefined).groupBy(categories.id).orderBy(asc(categories.sortOrder)); const items = rows.filter((row) => !query.nonEmpty || row.productCount > 0).map((row) => ({ ...row, imageUrl:row.imageKey ? getPublicUrl(row.imageKey) : null })); return withCache(ok({ items })); } catch (error) { return handleError(error); } }
