import { sql } from 'drizzle-orm';
import { db } from '@/server/db';
import { handleError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export async function GET() { try { await db.execute(sql`select 1`); return ok({ ok:true }); } catch (error) { return handleError(error); } }
