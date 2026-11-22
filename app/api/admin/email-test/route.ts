import { z } from 'zod';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { sendEmail } from '@/server/email';
import { handleError, ok } from '@/server/common/utils/api-response';
import { parseJson } from '@/server/common/utils/request';
import { env } from '@/server/common/utils/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  template: z.enum(['interest_customer', 'interest_store', 'reminder', 'contact_autoreply', 'contact_store', 'contact_reply']),
  to: z.string().email().optional(),
});

const SAMPLE_DATA = {
  reference: 'TRG-TEST01',
  customerName: 'Ada Okafor',
  customerEmail: 'customer@example.com',
  customerPhone: '+2348012345678',
  totalEstimate: 85000,
  items: [
    { productName: 'Leather Tote Bag', quantity: 1, unitPrice: 60000, imageUrl: null, availability: 'preorder' },
    { productName: 'Gold Heels', quantity: 1, unitPrice: 25000, imageUrl: null, availability: 'ready_stock' },
  ],
  leadTimeText: 'about 4 to 8 weeks',
  preorderNote: 'Preorder pieces are crafted after confirmation and arrive in 4-8 weeks.',
  whatsappNumber: env.DEFAULT_WHATSAPP_NUMBER,
  message: 'Thank you for your interest. We wanted to check in about your picks.',
  name: 'Ada Okafor',
};

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await parseJson(req, schema);
    const { interestCustomerConfirmation, interestAdminNotification, interestReminder, contactAutoReply, contactAdminNotification, contactReplyToCustomer } = await import('@/server/common/email-templates');
    const templates: Record<string, () => { subject: string; html: string; text: string }> = {
      interest_customer: () => interestCustomerConfirmation(SAMPLE_DATA),
      interest_store: () => interestAdminNotification(SAMPLE_DATA),
      reminder: () => interestReminder(SAMPLE_DATA),
      contact_autoreply: () => contactAutoReply(SAMPLE_DATA),
      contact_store: () => contactAdminNotification(SAMPLE_DATA),
      contact_reply: () => contactReplyToCustomer(SAMPLE_DATA),
    };
    const templateFn = templates[body.template];
    if (!templateFn) return ok({ error: 'Unknown template' }, 400);
    const payload = templateFn();
    const target = body.to ?? env.STORE_NOTIFY_EMAIL;
    const result = await sendEmail({ ...payload, to: target });
    return ok({ provider: result.provider, messageId: result.id });
  } catch (error) {
    return handleError(error);
  }
}
