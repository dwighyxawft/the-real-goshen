import { z } from 'zod';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseQuery } from '@/server/common/utils/request';
import { listPublicProducts } from '@/server/resources/products/products.service';
export const runtime = 'nodejs';
const querySchema = z.object({ q:z.string().min(2) });
export async function GET(req: Request) { try { const query = parseQuery(req.url, querySchema); const result = await listPublicProducts({ q:query.q, page:1, limit:6 }); return ok({ items:result.items.map((item) => ({ name:item.name, slug:item.slug, price:item.price, coverImage:item.coverImage, effectiveDiscount:item.effectiveDiscount, availability:item.availability })) }); } catch (error) { return handleError(error); } }
