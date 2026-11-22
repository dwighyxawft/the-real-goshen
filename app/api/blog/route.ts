import { and, desc, eq, lte } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/server/db';
import { blogPosts } from '@/server/db/schema';
import { getPublicUrl } from '@/server/storage/r2';
import { handleError, ok, withCache } from '@/server/common/utils/api-response';
import { parsePagination } from '@/server/common/utils/pagination';
import { parseQuery } from '@/server/common/utils/request';
export const runtime = 'nodejs';
const querySchema = z.object({ page:z.string().optional(), limit:z.string().optional() });
export async function GET(req: Request) { try { const query = parseQuery(req.url, querySchema); const { page, limit, offset } = parsePagination(query.page, query.limit, 9); const rows = await db.select().from(blogPosts).where(and(eq(blogPosts.isPublished, true), lte(blogPosts.publishedAt, new Date()))).orderBy(desc(blogPosts.publishedAt)); const items = rows.slice(offset, offset + limit).map((post) => ({ id:post.id, title:post.title, slug:post.slug, excerpt:post.excerpt, coverUrl:post.coverImageKey ? getPublicUrl(post.coverImageKey) : null, publishedAt:post.publishedAt, readMinutes:Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200)) })); return withCache(ok({ items, meta:{ page, limit, total:rows.length, totalPages:Math.max(1, Math.ceil(rows.length / limit)) } })); } catch (error) { return handleError(error); } }
