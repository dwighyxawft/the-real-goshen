import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { addReply } from '@/server/resources/contacts/admin-contacts.service';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ message: z.string().trim().min(1).max(5000) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    const { message } = await parseJson(req, schema);
    const contact = await addReply(params.id, admin.id, message);
    return ok(contact, 201);
  } catch (error) {
    return handleError(error);
  }
}
