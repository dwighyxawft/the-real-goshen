import { env } from '@/server/common/utils/env';
import { BrevoProvider } from './brevo.provider';
import { ResendProvider } from './resend.provider';
import type { EmailPayload, EmailProvider, EmailSendResult } from './email.types';

const providers: Record<'brevo' | 'resend', EmailProvider> = {
  brevo: new BrevoProvider(),
  resend: new ResendProvider(),
};

function orderedProviders(): EmailProvider[] {
  const primary = env.EMAIL_PROVIDER;
  const secondary = primary === 'brevo' ? 'resend' : 'brevo';
  return [providers[primary], providers[secondary]].filter((provider) => provider.isConfigured());
}

export async function sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
  const chain = orderedProviders();
  if (chain.length === 0) throw new Error('No email provider is configured');

  const errors: string[] = [];
  for (const provider of chain) {
    try {
      return await provider.send(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[email] ${provider.name} failed: ${message}`);
      errors.push(`${provider.name}: ${message}`);
    }
  }
  throw new Error(`All email providers failed. ${errors.join(' | ')}`);
}

export async function sendEmailSafe(payload: EmailPayload): Promise<boolean> {
  try {
    await sendEmail(payload);
    return true;
  } catch (error) {
    console.error('[email] giving up:', error instanceof Error ? error.message : error);
    return false;
  }
}
