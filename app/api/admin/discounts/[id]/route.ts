import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { updateDiscount, deleteDiscount } from '@/server/resources/discounts/admin-discounts.service';
import { handleError, ok, fail } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  scope: z.enum(['all', 'product']).optional(),
  productId: z.string().uuid().nullable().optional(),
  percentage: z.number().int().min(1).max(90).optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await parseJson(req, schema);
    const result = await updateDiscount(params.id, body);
    if (!result) return fail('Discount not found', 404);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const result = await deleteDiscount(params.id);
    if (!result) return fail('Discount not found', 404);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
