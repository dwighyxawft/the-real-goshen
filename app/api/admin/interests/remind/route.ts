import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { bulkRemindDryRun, bulkRemind } from '@/server/resources/interests/admin-interests.service';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  dryRun: z.boolean().optional().default(false),
  message: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { dryRun, message } = await parseJson(req, schema);
    if (dryRun) return ok(await bulkRemindDryRun());
    return ok(await bulkRemind(message));
  } catch (error) {
    return handleError(error);
  }
}
