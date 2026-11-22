import { apiFetch } from './client';

export type Category = { id: string; name: string; slug: string; imageKey: string | null; sortOrder: number; productCount?: number };

export async function listCategories() {
  return apiFetch<{ items: Category[] }>('/api/categories?nonEmpty=true');
}

export async function listAllCategories() {
  return apiFetch<{ items: Category[] }>('/api/categories');
}

export async function listAdminCategories() {
  return apiFetch<{ items: Category[] }>('/api/admin/categories');
}

export async function createCategory(name: string, imageKey?: string | null) {
  return apiFetch<Category>('/api/admin/categories', { method: 'POST', body: JSON.stringify({ name, imageKey }) });
}

export async function updateCategory(id: string, data: { name?: string; imageKey?: string | null }) {
  return apiFetch<Category>(`/api/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteCategory(id: string) {
  return apiFetch<{ affectedProducts: number }>(`/api/admin/categories/${id}`, { method: 'DELETE' });
}

export async function reorderCategories(ids: string[]) {
  return apiFetch<{ ok: boolean }>('/api/admin/categories/reorder', { method: 'PATCH', body: JSON.stringify({ ids }) });
}
