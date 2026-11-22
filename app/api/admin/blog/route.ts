import { requireAdmin } from '@/server/resources/auth/require-admin';
import { listAdminBlog, createBlogPost } from '@/server/resources/blog/admin-blog.service';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  title: z.string().trim().min(2).max(220),
  excerpt: z.string().max(1000).optional().default(''),
  content: z.string().max(50000).optional().default(''),
  coverImageKey: z.string().nullable().optional(),
  isPublished: z.boolean().optional().default(false),
  publishedAt: z.string().nullable().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
    return ok({ items: await listAdminBlog() });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await parseJson(req, schema);
    return ok(await createBlogPost(body), 201);
  } catch (error) {
    return handleError(error);
  }
}
