import { apiFetch } from './client';

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  availability: 'preorder' | 'ready_stock';
  leadTime: { min: number; max: number; text: string } | null;
  stockStatus: 'in_stock' | 'limited' | 'out_of_stock';
  isFeatured: boolean;
  images: string[];
  coverImage: string | null;
  category: { id: string; name: string; slug: string } | null;
  effectiveDiscount: { percentage: number; eventName: string; endsAt: Date; originalPrice: number; finalPrice: number } | null;
  imageKeys: string[];
  isPublished: boolean;
  categoryId: string | null;
  leadTimeWeeksMin: number | null;
  leadTimeWeeksMax: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductDTO = Omit<AdminProduct, 'imageKeys' | 'isPublished' | 'categoryId' | 'leadTimeWeeksMin' | 'leadTimeWeeksMax' | 'updatedAt'>;

export async function listProducts(params?: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  if (params) for (const [key, value] of Object.entries(params)) if (value !== undefined) query.set(key, String(value));
  return apiFetch<{ items: ProductDTO[]; total: number; page: number; limit: number; totalPages: number }>(`/api/products?${query}`);
}

export async function getProduct(slug: string) {
  return apiFetch<ProductDTO>(`/api/products/${slug}`);
}

export async function getRelated(slug: string) {
  return apiFetch<{ items: ProductDTO[] }>(`/api/products/${slug}/related`);
}

export async function searchProducts(q: string) {
  return apiFetch<{ items: ProductDTO[] }>(`/api/search?q=${encodeURIComponent(q)}`);
}

export async function getCartPrice(items: { productId: string; quantity: number }[]) {
  return apiFetch<{
    items: Array<{
      productId: string;
      slug?: string;
      name?: string;
      coverImage?: string | null;
      quantity: number;
      unitPrice?: number;
      originalPrice?: number;
      discountPercent?: number;
      lineTotal?: number;
      availability?: 'preorder' | 'ready_stock';
      leadTimeText?: string | null;
      available: boolean;
      unavailableReason?: 'removed' | 'out_of_stock';
    }>;
    totals: { subtotal: number; savings: number; estimatedTotal: number };
    hasPreorder: boolean;
    preorderNote: string | null;
  }>('/api/cart/price', { method: 'POST', body: JSON.stringify({ items }) });
}

export async function getActiveDiscounts() {
  return apiFetch<{ events: any[]; storeWide: any | null }>(`/api/discounts/active`);
}

export async function listAdminProducts(params?: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  if (params) for (const [key, value] of Object.entries(params)) if (value !== undefined) query.set(key, String(value));
  return apiFetch<{ items: AdminProduct[]; total: number; page: number; limit: number; totalPages: number }>(`/api/admin/products?${query}`);
}

export async function getAdminProduct(id: string) {
  return apiFetch<AdminProduct>(`/api/admin/products/${id}`);
}

export async function createProduct(data: Record<string, unknown>) {
  return apiFetch<AdminProduct>('/api/admin/products', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  return apiFetch<AdminProduct>(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteProduct(id: string) {
  return apiFetch<{ id: string }>(`/api/admin/products/${id}`, { method: 'DELETE' });
}

export async function publishProduct(id: string, isPublished: boolean) {
  return apiFetch<AdminProduct>(`/api/admin/products/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ isPublished }) });
}

export async function duplicateProduct(id: string) {
  return apiFetch<AdminProduct>(`/api/admin/products/${id}/duplicate`, { method: 'POST' });
}

export async function bulkUpdateProducts(ids: string[], action: string) {
  return apiFetch<{ affected: number }>('/api/admin/products/bulk', { method: 'PATCH', body: JSON.stringify({ ids, action }) });
}
