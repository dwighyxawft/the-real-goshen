import { count } from 'drizzle-orm';
import { db } from '@/server/db';
import { admins } from '@/server/db/schema';
import { handleError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export async function GET() { try { const [{ value }] = await db.select({ value:count(admins.id) }).from(admins); return ok({ needsSetup:Number(value) === 0 }); } catch (error) { return handleError(error); } }
