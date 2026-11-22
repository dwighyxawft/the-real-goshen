import { handleError, ok } from '@/server/common/utils/api-response';
import { getPublicProduct } from '@/server/resources/products/products.service';
export const runtime = 'nodejs';
export async function GET(_: Request, { params }:{ params:{ slug:string } }) { try { const product = await getPublicProduct(params.slug); if (!product) return ok({ message:'Product not found' }, 404); return ok(product); } catch (error) { return handleError(error); } }
