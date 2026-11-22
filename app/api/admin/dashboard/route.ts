import { requireAdmin } from '@/server/resources/auth/require-admin';
import { getDashboard } from '@/server/resources/dashboard/dashboard.service';
import { handleError, ok } from '@/server/common/utils/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    return ok(await getDashboard());
  } catch (error) {
    return handleError(error);
  }
}
