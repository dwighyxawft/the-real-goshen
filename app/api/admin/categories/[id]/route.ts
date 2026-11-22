import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { deleteCategory, updateCategory } from '@/server/resources/categories/categories.service';
import { handleError, HttpError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';
export const runtime='nodejs'; export const dynamic='force-dynamic';
const schema=z.object({ name:z.string().trim().min(2).max(100).optional(), imageKey:z.string().startsWith('site/').nullable().optional() });
export async function PATCH(req:Request,{params}:{params:{id:string}}){try{await requireAdmin(); const result=await updateCategory(params.id,await parseJson(req,schema)); if(!result)throw new HttpError(404,'Category not found'); return ok(result);}catch(error){return handleError(error);}}
export async function DELETE(_:Request,{params}:{params:{id:string}}){try{await requireAdmin(); const result=await deleteCategory(params.id); if(!result)throw new HttpError(404,'Category not found'); return ok(result);}catch(error){return handleError(error);}}
