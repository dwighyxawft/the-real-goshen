import { requireAdmin } from '@/server/resources/auth/require-admin';
import { getCounts } from '@/server/resources/dashboard/dashboard.service';
import { handleError, ok } from '@/server/common/utils/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    return ok(await getCounts());
  } catch (error) {
    return handleError(error);
  }
}
