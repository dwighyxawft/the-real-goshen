import { env } from '@/server/common/utils/env';
import type { EmailPayload, EmailProvider, EmailSendResult } from './email.types';

export class BrevoProvider implements EmailProvider {
  readonly name = 'brevo' as const;

  isConfigured(): boolean {
    return Boolean(env.BREVO_API_KEY);
  }

  async send(payload: EmailPayload): Promise<EmailSendResult> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY as string,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: payload.fromName ?? env.EMAIL_FROM_NAME, email: env.EMAIL_FROM_ADDRESS },
        to: (Array.isArray(payload.to) ? payload.to : [payload.to]).map((email) => ({ email })),
        subject: payload.subject,
        htmlContent: payload.html,
        textContent: payload.text,
        ...(payload.replyTo ? { replyTo: { email: payload.replyTo } } : {}),
      }),
    });

    if (!response.ok) throw new Error(`Brevo ${response.status}: ${await response.text()}`);
    const data = (await response.json()) as { messageId?: string };
    return { id: data.messageId, provider: this.name };
  }
}
