import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { getAdminContact, updateContactStatus } from '@/server/resources/contacts/admin-contacts.service';
import { handleError, ok, fail } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ status: z.enum(['new', 'read', 'replied', 'closed']) });

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const contact = await getAdminContact(params.id);
    if (!contact) return fail('Contact not found', 404);
    return ok(contact);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const { status } = await parseJson(req, schema);
    const contact = await updateContactStatus(params.id, status);
    if (!contact) return fail('Contact not found', 404);
    return ok(contact);
  } catch (error) {
    return handleError(error);
  }
}
