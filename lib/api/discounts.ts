import { apiFetch } from './client';

export type DiscountEvent = {
  id: string;
  name: string;
  scope: 'all' | 'product';
  productId: string | null;
  percentage: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  state?: string;
  product?: { id: string; name: string; slug?: string } | null;
  createdAt: Date;
};

export async function listAdminDiscounts() {
  return apiFetch<{ items: DiscountEvent[] }>('/api/admin/discounts');
}

export async function createDiscount(data: { name: string; scope: 'all' | 'product'; productId?: string | null; percentage: number; startsAt: string; endsAt: string; isActive?: boolean }) {
  return apiFetch<DiscountEvent>('/api/admin/discounts', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateDiscount(id: string, data: Record<string, unknown>) {
  return apiFetch<DiscountEvent>(`/api/admin/discounts/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function toggleDiscount(id: string) {
  return apiFetch<DiscountEvent>(`/api/admin/discounts/${id}/toggle`, { method: 'PATCH' });
}

export async function deleteDiscount(id: string) {
  return apiFetch<{ id: string }>(`/api/admin/discounts/${id}`, { method: 'DELETE' });
}
