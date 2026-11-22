import { apiFetch } from './client';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageKey: string | null;
  coverImageUrl: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
};

export async function listBlogPosts() {
  return apiFetch<{ items: BlogPost[] }>('/api/blog');
}

export async function getBlogPost(slug: string) {
  return apiFetch<BlogPost>(`/api/blog/${slug}`);
}

export async function listAdminBlog() {
  return apiFetch<{ items: BlogPost[] }>('/api/admin/blog');
}

export async function getAdminBlogPost(id: string) {
  return apiFetch<BlogPost>(`/api/admin/blog/${id}`);
}

export async function createBlogPost(data: Record<string, unknown>) {
  return apiFetch<BlogPost>('/api/admin/blog', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBlogPost(id: string, data: Record<string, unknown>) {
  return apiFetch<BlogPost>(`/api/admin/blog/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteBlogPost(id: string) {
  return apiFetch<{ id: string }>(`/api/admin/blog/${id}`, { method: 'DELETE' });
}
