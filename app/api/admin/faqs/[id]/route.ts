import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { updateFaq, deleteFaq } from '@/server/resources/faqs/admin-faqs.service';
import { handleError, ok, fail } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  question: z.string().trim().min(2).max(500).optional(),
  answer: z.string().trim().min(2).max(5000).optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await parseJson(req, schema);
    const result = await updateFaq(params.id, body);
    if (!result) return fail('FAQ not found', 404);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const result = await deleteFaq(params.id);
    if (!result) return fail('FAQ not found', 404);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
