import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { setPublished } from '@/server/resources/products/admin-products.service';
import { handleError, ok, fail } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ isPublished: z.boolean() });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const { isPublished } = await parseJson(req, schema);
    const product = await setPublished(params.id, isPublished);
    if (!product) return fail('Product not found', 404);
    return ok(product);
  } catch (error) {
    return handleError(error);
  }
}
