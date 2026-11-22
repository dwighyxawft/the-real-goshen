export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  fromName?: string;
  replyTo?: string;
}

export interface EmailSendResult {
  id?: string;
  provider: 'brevo' | 'resend';
}

export interface EmailProvider {
  readonly name: 'brevo' | 'resend';
  isConfigured(): boolean;
  send(payload: EmailPayload): Promise<EmailSendResult>;
}
