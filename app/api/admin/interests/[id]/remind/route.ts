import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { sendReminder } from '@/server/resources/interests/admin-interests.service';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ message: z.string().max(2000).optional() });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const { message } = await parseJson(req, schema);
    const interest = await sendReminder(params.id, message);
    return ok(interest);
  } catch (error) {
    return handleError(error);
  }
}
