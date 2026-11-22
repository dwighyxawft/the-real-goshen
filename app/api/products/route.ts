import { z } from 'zod';
import { handleError, ok, withCache } from '@/server/common/utils/api-response';
import { parsePagination } from '@/server/common/utils/pagination';
import { parseQuery } from '@/server/common/utils/request';
import { listPublicProducts } from '@/server/resources/products/products.service';
export const runtime = 'nodejs';
const querySchema = z.object({ q:z.string().optional(), category:z.string().optional(), availability:z.enum(['preorder','ready_stock']).optional(), featured:z.string().optional(), sort:z.enum(['newest','price_asc','price_desc','on_sale']).optional(), page:z.string().optional(), limit:z.string().optional() });
export async function GET(req: Request) { try { const query = parseQuery(req.url, querySchema); const pagination = parsePagination(query.page, query.limit, 48); const result = await listPublicProducts({ ...query, featured:query.featured === '1', page:pagination.page, limit:pagination.limit }); return withCache(ok({ items:result.items, meta:{ page:pagination.page, limit:pagination.limit, total:result.total, totalPages:Math.max(1, Math.ceil(result.total / pagination.limit)) } }), 30); } catch (error) { return handleError(error); } }
