import { requireAdmin } from '@/server/resources/auth/require-admin';
import { handleError } from '@/server/common/utils/api-response';
import { env } from '@/server/common/utils/env';
import { interestCustomerConfirmation, interestAdminNotification, interestReminder, contactAutoReply, contactAdminNotification, contactReplyToCustomer } from '@/server/common/email-templates';
import { getAutoReplyCopy } from '@/server/resources/contacts/admin-contacts.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SAMPLE = {
  reference: 'TRG-PREV01',
  customerName: 'Ada Okafor',
  customerEmail: 'customer@example.com',
  customerPhone: '+2348012345678',
  totalEstimate: 85000,
  items: [
    { productName: 'Leather Tote Bag (Preorder)', quantity: 1, unitPrice: 60000, originalPrice: 75000, imageUrl: null, availability: 'preorder' as const },
    { productName: 'Gold Heels (Ready Stock)', quantity: 1, unitPrice: 25000, originalPrice: 25000, imageUrl: null, availability: 'ready_stock' as const },
  ],
  leadTimeText: 'about 4 to 8 weeks',
  preorderNote: 'Preorder pieces are crafted after confirmation and arrive in 4-8 weeks.',
  whatsappNumber: env.DEFAULT_WHATSAPP_NUMBER,
  message: 'Thank you for your interest. We wanted to check in about your picks.',
  name: 'Ada Okafor',
};

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const template = url.searchParams.get('template') ?? '';
    const templates: Record<string, () => { subject: string; html: string; text: string }> = {
      interest_customer: () => interestCustomerConfirmation(SAMPLE),
      interest_store: () => interestAdminNotification(SAMPLE),
      reminder: () => interestReminder(SAMPLE),
      contact_autoreply_general_enquiry: () => contactAutoReply({ ...SAMPLE, message: getAutoReplyCopy('general') }),
      contact_autoreply_complaint: () => contactAutoReply({ ...SAMPLE, message: getAutoReplyCopy('complaint') }),
      contact_autoreply_order: () => contactAutoReply({ ...SAMPLE, message: getAutoReplyCopy('order') }),
      contact_autoreply_product: () => contactAutoReply({ ...SAMPLE, message: getAutoReplyCopy('product') }),
      contact_autoreply_partnership: () => contactAutoReply({ ...SAMPLE, message: getAutoReplyCopy('partnership') }),
      contact_store: () => contactAdminNotification(SAMPLE),
      contact_reply: () => contactReplyToCustomer(SAMPLE),
    };
    const fn = templates[template];
    if (!fn) {
      return new Response('Unknown template. Available: ' + Object.keys(templates).join(', '), { status: 400, headers: { 'Content-Type': 'text/plain' } });
    }
    const result = fn();
    return new Response(result.html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch (error) {
    return handleError(error);
  }
}
