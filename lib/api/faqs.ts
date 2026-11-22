import { apiFetch } from './client';

export type Faq = { id: string; question: string; answer: string; sortOrder: number; isPublished: boolean };

export async function listFaqs() {
  return apiFetch<{ items: Faq[] }>('/api/faqs');
}

export async function listAdminFaqs() {
  return apiFetch<{ items: Faq[] }>('/api/admin/faqs');
}

export async function createFaq(question: string, answer: string, isPublished = true) {
  return apiFetch<Faq>('/api/admin/faqs', { method: 'POST', body: JSON.stringify({ question, answer, isPublished }) });
}

export async function updateFaq(id: string, data: Partial<{ question: string; answer: string; isPublished: boolean }>) {
  return apiFetch<Faq>(`/api/admin/faqs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteFaq(id: string) {
  return apiFetch<{ id: string }>(`/api/admin/faqs/${id}`, { method: 'DELETE' });
}

export async function reorderFaqs(ids: string[]) {
  return apiFetch<{ ok: boolean }>('/api/admin/faqs/reorder', { method: 'PATCH', body: JSON.stringify({ ids }) });
}
