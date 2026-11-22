import { desc, eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { contactReplies, contacts } from '@/server/db/schema';
import { sendEmailSafe } from '@/server/email';
import { contactReplyToCustomer, contactAutoReply } from '@/server/common/email-templates';
import { env } from '@/server/common/utils/env';
import { HttpError } from '@/server/common/utils/http-error';

const VALID_STATUSES = ['new', 'read', 'replied', 'closed'];
const SUBJECT_COPY: Record<string, string> = {
  general: 'Thank you for reaching out. We usually reply within 24 hours.',
  order: 'Thank you for your interest. We will get back to you about your order shortly.',
  product: 'Thank you for your product enquiry. We will get back to you with details shortly.',
  partnership: 'Thank you for considering a partnership with TrG_studio. We will review your proposal and reply soon.',
  complaint: 'We are sorry to hear about your experience. We are looking into it and will reply shortly.',
};

export async function listAdminContacts(input: { status?: string; q?: string; page: number; limit: number }) {
  const rows = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  let items = rows;
  if (input.status) items = items.filter((row) => row.status === input.status);
  if (input.q) {
    const q = input.q.toLowerCase();
    items = items.filter((row) => row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q) || row.message.toLowerCase().includes(q));
  }
  const total = items.length;
  const pageItems = items.slice((input.page - 1) * input.limit, input.page * input.limit);
  return { items: pageItems, total };
}

export async function getAdminContact(id: string) {
  const contact = (await db.select().from(contacts).where(eq(contacts.id, id)).limit(1))[0];
  if (!contact) return null;
  const replies = await db.select().from(contactReplies).where(eq(contactReplies.contactId, id)).orderBy(desc(contactReplies.createdAt));
  return { ...contact, replies };
}

export async function updateContactStatus(id: string, status: string) {
  if (!VALID_STATUSES.includes(status)) throw new HttpError(422, 'Invalid status');
  const [updated] = await db.update(contacts).set({ status: status as 'new' | 'read' | 'replied' | 'closed' }).where(eq(contacts.id, id)).returning();
  if (!updated) return null;
  return getAdminContact(id);
}

export async function addReply(id: string, adminId: string, message: string) {
  const contact = (await db.select().from(contacts).where(eq(contacts.id, id)).limit(1))[0];
  if (!contact) throw new HttpError(404, 'Contact not found');
  const [reply] = await db.insert(contactReplies).values({ contactId: id, adminId, message }).returning();
  const sent = await sendEmailSafe({ ...contactReplyToCustomer({ name: contact.name, message }), to: contact.email, replyTo: env.STORE_NOTIFY_EMAIL });
  if (sent) await db.update(contactReplies).set({ emailSent: true }).where(eq(contactReplies.id, reply.id));
  await db.update(contacts).set({ status: 'replied' as const }).where(eq(contacts.id, id));
  return getAdminContact(id);
}

export async function resendReply(contactId: string, replyId: string) {
  const contact = (await db.select().from(contacts).where(eq(contacts.id, contactId)).limit(1))[0];
  if (!contact) throw new HttpError(404, 'Contact not found');
  const reply = (await db.select().from(contactReplies).where(eq(contactReplies.id, replyId)).limit(1))[0];
  if (!reply || reply.contactId !== contactId) throw new HttpError(404, 'Reply not found');
  const sent = await sendEmailSafe({ ...contactReplyToCustomer({ name: contact.name, message: reply.message }), to: contact.email, replyTo: env.STORE_NOTIFY_EMAIL });
  if (sent) await db.update(contactReplies).set({ emailSent: true }).where(eq(contactReplies.id, replyId));
  return getAdminContact(contactId);
}

export function getAutoReplyCopy(subject: string): string {
  return SUBJECT_COPY[subject] ?? SUBJECT_COPY.general;
}
