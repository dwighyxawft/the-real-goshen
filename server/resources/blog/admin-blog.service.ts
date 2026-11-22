import { desc, eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { blogPosts } from '@/server/db/schema';
import { uniqueSlug } from '@/server/common/utils/slug';
import { deleteObject } from '@/server/storage/r2';
import { getPublicUrl } from '@/server/storage/r2';

function toDTO(post: typeof blogPosts.$inferSelect) {
  return { ...post, coverImageUrl: post.coverImageKey ? getPublicUrl(post.coverImageKey) : null };
}

export async function listAdminBlog() {
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  return rows.map(toDTO);
}

export async function getAdminBlogPost(id: string) {
  const post = (await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1))[0];
  return post ? toDTO(post) : null;
}

export async function createBlogPost(input: { title: string; excerpt?: string; content?: string; coverImageKey?: string | null; isPublished?: boolean; publishedAt?: string | null }) {
  const slug = await uniqueSlug(input.title, 'blog');
  const publishedAt = input.isPublished ? (input.publishedAt ? new Date(input.publishedAt) : new Date()) : null;
  const [created] = await db.insert(blogPosts).values({
    title: input.title,
    slug,
    excerpt: input.excerpt ?? '',
    content: input.content ?? '',
    coverImageKey: input.coverImageKey ?? null,
    isPublished: input.isPublished ?? false,
    publishedAt,
  }).returning();
  return toDTO(created);
}

export async function updateBlogPost(id: string, input: Partial<{ title: string; excerpt: string; content: string; coverImageKey: string | null; isPublished: boolean; publishedAt: string | null }>) {
  const current = (await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1))[0];
  if (!current) return null;
  const set: Record<string, unknown> = { ...input };
  if (input.title && input.title !== current.title) set.slug = await uniqueSlug(input.title, 'blog', id);
  if (input.isPublished !== undefined) {
    set.publishedAt = input.isPublished ? (input.publishedAt ? new Date(input.publishedAt) : current.publishedAt ?? new Date()) : null;
  } else if (input.publishedAt !== undefined) {
    set.publishedAt = input.publishedAt ? new Date(input.publishedAt) : null;
  }
  const [updated] = await db.update(blogPosts).set(set).where(eq(blogPosts.id, id)).returning();
  if (current.coverImageKey && input.coverImageKey !== undefined && current.coverImageKey !== input.coverImageKey) {
    try { await deleteObject(current.coverImageKey); } catch (error) { console.error('blog cover cleanup failed', error); }
  }
  return toDTO(updated);
}

export async function deleteBlogPost(id: string) {
  const post = (await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1))[0];
  if (!post) return null;
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  if (post.coverImageKey) { try { await deleteObject(post.coverImageKey); } catch (error) { console.error('blog cover cleanup failed', error); } }
  return { id };
}
