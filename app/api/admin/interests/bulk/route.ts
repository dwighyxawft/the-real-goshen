import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { bulkUpdateInterests } from '@/server/resources/interests/admin-interests.service';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
  action: z.enum(['mark_done', 'cancel', 'delete']),
});

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const { ids, action } = await parseJson(req, schema);
    const result = await bulkUpdateInterests(ids, action);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
