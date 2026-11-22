import { and, eq, lte } from 'drizzle-orm';
import { db } from '@/server/db';
import { blogPosts } from '@/server/db/schema';
import { getPublicUrl } from '@/server/storage/r2';
import { handleError, HttpError } from '@/server/common/utils/api-response';
import { ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export async function GET(_: Request, { params }: { params:{ slug:string } }) { try { const post = (await db.select().from(blogPosts).where(and(eq(blogPosts.slug, params.slug), eq(blogPosts.isPublished, true), lte(blogPosts.publishedAt, new Date()))).limit(1))[0]; if (!post) throw new Error('NOT_FOUND'); return ok({ ...post, coverUrl:post.coverImageKey ? getPublicUrl(post.coverImageKey) : null }); } catch (error) { if (error instanceof Error && error.message === 'NOT_FOUND') return ok({ message:'Not found' }, 404); return handleError(error); } }
