import { requireAdmin } from '@/server/resources/auth/require-admin';
import { resendConfirmation } from '@/server/resources/interests/admin-interests.service';
import { handleError, ok } from '@/server/common/utils/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const interest = await resendConfirmation(params.id);
    return ok(interest);
  } catch (error) {
    return handleError(error);
  }
}
