import { db } from '@/server/db';
import { products, categories, blogPosts } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

export function slugify(value: string): string { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 220); }
export async function uniqueSlug(value: string, resource: 'products' | 'categories' | 'blog', currentId?: string): Promise<string> { const base = slugify(value) || 'item'; let slug = base; for (let index = 1; index < 100; index += 1) { const table = resource === 'products' ? products : resource === 'categories' ? categories : blogPosts; const match = await db.select({ id: table.id }).from(table).where(eq(table.slug, slug)).limit(1); if (!match[0] || match[0].id === currentId) return slug; slug = `${base}-${index}`; } throw new Error('Could not generate a unique slug'); }
