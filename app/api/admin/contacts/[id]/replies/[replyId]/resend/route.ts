import { requireAdmin } from '@/server/resources/auth/require-admin';
import { resendReply } from '@/server/resources/contacts/admin-contacts.service';
import { handleError, ok } from '@/server/common/utils/api-response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string; replyId: string } }) {
  try {
    await requireAdmin();
    const contact = await resendReply(params.id, params.replyId);
    return ok(contact);
  } catch (error) {
    return handleError(error);
  }
}
