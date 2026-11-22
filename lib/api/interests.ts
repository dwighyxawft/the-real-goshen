import { apiFetch } from './client';

export type Interest = {
  id: string;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note: string | null;
  status: 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';
  totalEstimate: number;
  emailSentToCustomer: boolean;
  emailSentToStore: boolean;
  lastRemindedAt: Date | null;
  reminderCount: number;
  completedAt: Date | null;
  createdAt: Date;
};

export type InterestDetail = Interest & {
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    productImageKey: string | null;
    imageUrl: string | null;
    unitPrice: number;
    originalPrice: number;
    discountPercent: number;
    quantity: number;
    availability: 'preorder' | 'ready_stock';
    leadTimeWeeksMin: number | null;
    leadTimeWeeksMax: number | null;
  }>;
  reminders: Array<{ id: string; message: string | null; success: boolean; sentAt: Date }>;
  hasPreorder: boolean;
};

export async function createInterest(data: { customerName: string; customerEmail: string; customerPhone: string; note?: string; items: { productId: string; quantity: number }[]; website?: string }) {
  return apiFetch<{ reference: string; whatsappNumber: string; hasPreorder: boolean; longestLeadTimeText: string | null }>('/api/interests', { method: 'POST', body: JSON.stringify(data) });
}

export async function listAdminInterests(params?: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  if (params) for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  return apiFetch<{ items: Interest[]; tabCounts: { today: number; past: number; all: number }; total: number; page: number; limit: number; totalPages: number }>(`/api/admin/interests?${query}`);
}

export async function getAdminInterest(id: string) {
  return apiFetch<InterestDetail>(`/api/admin/interests/${id}`);
}

export async function updateInterestStatus(id: string, status: string) {
  return apiFetch<InterestDetail>(`/api/admin/interests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function bulkUpdateInterests(ids: string[], action: string) {
  return apiFetch<{ affected: number }>('/api/admin/interests/bulk', { method: 'PATCH', body: JSON.stringify({ ids, action }) });
}

export async function sendReminder(id: string, message?: string) {
  return apiFetch<InterestDetail>(`/api/admin/interests/${id}/remind`, { method: 'POST', body: JSON.stringify({ message }) });
}

export async function bulkRemind(dryRun: boolean, message?: string) {
  return apiFetch<{ canRemind?: number; willSkip?: number; items?: any[]; sent?: number; total?: number }>('/api/admin/interests/remind', { method: 'POST', body: JSON.stringify({ dryRun, message }) });
}

export async function resendConfirmation(id: string) {
  return apiFetch<InterestDetail>(`/api/admin/interests/${id}/resend-confirmation`, { method: 'POST' });
}
