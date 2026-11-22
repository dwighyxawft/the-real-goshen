import { requireAdmin } from '@/server/resources/auth/require-admin';
import { duplicateProduct } from '@/server/resources/products/admin-products.service';
import { handleError, ok, fail } from '@/server/common/utils/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const product = await duplicateProduct(params.id);
    if (!product) return fail('Product not found', 404);
    return ok(product, 201);
  } catch (error) {
    return handleError(error);
  }
}
