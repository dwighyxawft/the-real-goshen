import { z } from 'zod';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';
import { getCartPrice } from '@/server/resources/products/products.service';
export const runtime = 'nodejs';
const schema = z.object({ items:z.array(z.object({ productId:z.string().uuid(), quantity:z.number().int().min(1).max(10) })).min(1).max(30) });
export async function POST(req: Request) { try { const body = await parseJson(req, schema); return ok(await getCartPrice(body.items)); } catch (error) { return handleError(error); } }
