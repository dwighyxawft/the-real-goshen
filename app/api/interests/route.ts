import { z } from 'zod';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson, getClientIp } from '@/server/common/utils/request';
import { enforceRateLimit } from '@/server/resources/rate-limit/rate-limit.service';
import { createInterest } from '@/server/resources/interests/interests.service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const schema = z.object({ customerName:z.string().trim().min(2).max(150), customerEmail:z.string().trim().email().transform((value) => value.toLowerCase()), customerPhone:z.string().trim().min(7).max(30), note:z.string().trim().max(500).optional(), website:z.string().optional().default(''), items:z.array(z.object({ productId:z.string().uuid(), quantity:z.number().int().min(1).max(10) })).min(1).max(30) });
export async function POST(req: Request) { try { const body = await parseJson(req, schema); if (body.website) return ok({ reference:'TRG-REVIEW' }, 201); await enforceRateLimit(`interest:${getClientIp(req)}`, 5, 3600); return ok(await createInterest(body), 201); } catch (error) { return handleError(error); } }
