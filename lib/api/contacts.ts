import { apiFetch } from './client';

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  autoReplySent: boolean;
  storeNotified: boolean;
  createdAt: Date;
};

export type ContactDetail = Contact & {
  replies: Array<{ id: string; adminId: string | null; message: string; emailSent: boolean; createdAt: Date }>;
};

export async function submitContact(data: { name: string; email: string; phone?: string; subject: string; message: string; website?: string }) {
  return apiFetch<{ ok: boolean }>('/api/contact', { method: 'POST', body: JSON.stringify(data) });
}

export async function listAdminContacts(params?: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  if (params) for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  return apiFetch<{ items: Contact[]; total: number; page: number; limit: number; totalPages: number }>(`/api/admin/contacts?${query}`);
}

export async function getAdminContact(id: string) {
  return apiFetch<ContactDetail>(`/api/admin/contacts/${id}`);
}

export async function updateContactStatus(id: string, status: string) {
  return apiFetch<ContactDetail>(`/api/admin/contacts/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function addReply(id: string, message: string) {
  return apiFetch<ContactDetail>(`/api/admin/contacts/${id}/replies`, { method: 'POST', body: JSON.stringify({ message }) });
}

export async function resendReply(contactId: string, replyId: string) {
  return apiFetch<ContactDetail>(`/api/admin/contacts/${contactId}/replies/${replyId}/resend`, { method: 'POST' });
}
