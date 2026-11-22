import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { reorderCategories } from '@/server/resources/categories/categories.service';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';
export const runtime='nodejs'; export const dynamic='force-dynamic';
const schema=z.object({ids:z.array(z.string().uuid()).min(1)});
export async function PATCH(req:Request){try{await requireAdmin(); await reorderCategories((await parseJson(req,schema)).ids); return ok({ok:true});}catch(error){return handleError(error);}}
