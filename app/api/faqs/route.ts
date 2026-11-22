import { asc, eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { faqs } from '@/server/db/schema';
import { handleError, ok, withCache } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export async function GET() { try { return withCache(ok({ items:await db.select({ id:faqs.id, question:faqs.question, answer:faqs.answer }).from(faqs).where(eq(faqs.isPublished, true)).orderBy(asc(faqs.sortOrder)) })); } catch (error) { return handleError(error); } }
