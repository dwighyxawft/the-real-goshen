import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { getAdminInterest, updateInterestStatus } from '@/server/resources/interests/admin-interests.service';
import { handleError, ok, fail } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ status: z.enum(['new', 'contacted', 'confirmed', 'completed', 'cancelled']) });

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const interest = await getAdminInterest(params.id);
    if (!interest) return fail('Interest not found', 404);
    return ok(interest);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const { status } = await parseJson(req, schema);
    const interest = await updateInterestStatus(params.id, status);
    if (!interest) return fail('Interest not found', 404);
    return ok(interest);
  } catch (error) {
    return handleError(error);
  }
}
