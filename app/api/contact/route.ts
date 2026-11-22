import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { contacts } from '@/server/db/schema';
import { sendEmailSafe } from '@/server/email';
import { contactAdminNotification, contactAutoReply } from '@/server/common/email-templates';
import { getAutoReplyCopy } from '@/server/resources/contacts/admin-contacts.service';
import { env } from '@/server/common/utils/env';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson, getClientIp } from '@/server/common/utils/request';
import { enforceRateLimit } from '@/server/resources/rate-limit/rate-limit.service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const schema = z.object({ name:z.string().trim().min(2).max(150), email:z.string().trim().email().transform((value) => value.toLowerCase()), phone:z.string().trim().max(40).optional(), subject:z.enum(['general','order','product','partnership','complaint']), message:z.string().trim().min(10).max(2000), website:z.string().optional().default('') });
export async function POST(req: Request) { try { const body = await parseJson(req, schema); if (body.website) return ok({ ok:true }, 201); await enforceRateLimit(`contact:${getClientIp(req)}`, 5, 3600); const [contact] = await db.insert(contacts).values({ name:body.name, email:body.email, phone:body.phone, subject:body.subject, message:body.message }).returning(); const autoReplySent = await sendEmailSafe({ ...contactAutoReply({ name:contact.name, message:getAutoReplyCopy(body.subject) }), to:contact.email }); const storeNotified = await sendEmailSafe({ ...contactAdminNotification({ name:contact.name, message:contact.message }), to:env.STORE_NOTIFY_EMAIL, replyTo:contact.email }); await db.update(contacts).set({ autoReplySent, storeNotified }).where(eq(contacts.id, contact.id)); return ok({ ok:true }, 201); } catch (error) { return handleError(error); } }
