import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { getAdminBlogPost, updateBlogPost, deleteBlogPost } from '@/server/resources/blog/admin-blog.service';
import { handleError, ok, fail } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  title: z.string().trim().min(2).max(220).optional(),
  excerpt: z.string().max(1000).optional(),
  content: z.string().max(50000).optional(),
  coverImageKey: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().nullable().optional(),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const post = await getAdminBlogPost(params.id);
    if (!post) return fail('Post not found', 404);
    return ok(post);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await parseJson(req, schema);
    const post = await updateBlogPost(params.id, body);
    if (!post) return fail('Post not found', 404);
    return ok(post);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const result = await deleteBlogPost(params.id);
    if (!result) return fail('Post not found', 404);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
