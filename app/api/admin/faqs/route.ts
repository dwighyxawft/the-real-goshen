import { requireAdmin } from '@/server/resources/auth/require-admin';
import { listAdminFaqs, createFaq } from '@/server/resources/faqs/admin-faqs.service';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  question: z.string().trim().min(2).max(500),
  answer: z.string().trim().min(2).max(5000),
  isPublished: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    await requireAdmin();
    return ok({ items: await listAdminFaqs() });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await parseJson(req, schema);
    return ok(await createFaq(body), 201);
  } catch (error) {
    return handleError(error);
  }
}
