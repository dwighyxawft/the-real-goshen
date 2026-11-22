import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { getAdminProduct, updateProduct, deleteProduct } from '@/server/resources/products/admin-products.service';
import { handleError, ok, fail } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().int().min(0).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  images: z.array(z.string().startsWith('products/')).max(8).optional(),
  availability: z.enum(['preorder', 'ready_stock']).optional(),
  leadTimeWeeksMin: z.number().int().min(0).nullable().optional(),
  leadTimeWeeksMax: z.number().int().min(0).nullable().optional(),
  stockStatus: z.enum(['in_stock', 'limited', 'out_of_stock']).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const product = await getAdminProduct(params.id);
    if (!product) return fail('Product not found', 404);
    return ok(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await parseJson(req, updateSchema);
    const product = await updateProduct(params.id, body);
    if (!product) return fail('Product not found', 404);
    return ok(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const result = await deleteProduct(params.id);
    if (!result) return fail('Product not found', 404);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
