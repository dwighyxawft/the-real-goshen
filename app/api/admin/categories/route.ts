import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { createCategory, listCategories } from '@/server/resources/categories/categories.service';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';
export const runtime='nodejs'; export const dynamic='force-dynamic';
const schema=z.object({ name:z.string().trim().min(2).max(100), imageKey:z.string().startsWith('site/').nullable().optional() });
export async function GET(){try{await requireAdmin(); return ok({items:await listCategories()});}catch(error){return handleError(error);}}
export async function POST(req:Request){try{await requireAdmin(); return ok(await createCategory(await parseJson(req,schema)),201);}catch(error){return handleError(error);}}
