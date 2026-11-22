import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { uploadImage, deleteObject } from '@/server/storage/r2';
import { parseJson } from '@/server/common/utils/request';
import { handleError, HttpError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic';
const folderSchema = z.enum(['products','blog','site']);
export async function POST(req: Request) { try { await requireAdmin(); const folder = folderSchema.parse(new URL(req.url).searchParams.get('folder')); const form = await req.formData(); const file = form.get('file'); if (!(file instanceof File)) throw new HttpError(422, 'A file is required.'); const result = await uploadImage({ buffer:Buffer.from(await file.arrayBuffer()), contentType:file.type, size:file.size }, folder); return ok({ key:result.key, url:result.url }, 201); } catch(error) { return handleError(error); } }
const deleteSchema = z.object({ key:z.string().regex(/^(products|blog|site)\//) });
export async function DELETE(req: Request) { try { await requireAdmin(); const body = await parseJson(req, deleteSchema); await deleteObject(body.key); return ok({ ok:true }); } catch(error) { return handleError(error); } }
