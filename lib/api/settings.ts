import { apiFetch } from './client';

export type PublicSettings = {
  whatsappNumber: string;
  storeEmail: string;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  facebookUrl: string | null;
  address: string | null;
  businessHours: string | null;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string | null;
  aboutBody: string;
  aboutImageUrl: string | null;
  announcementText: string | null;
  announcementActive: boolean;
  defaultLeadTimeWeeksMin: number;
  defaultLeadTimeWeeksMax: number;
  preorderNote: string | null;
};

export async function getPublicSettings() {
  return apiFetch<PublicSettings>('/api/settings/public');
}

export async function getAdminSettings() {
  return apiFetch<PublicSettings & { heroImageKey: string | null; aboutImageKey: string | null; heroImageUrl: string | null; aboutImageUrl: string | null }>('/api/admin/settings');
}

export async function updateSettings(data: Record<string, unknown>) {
  return apiFetch<Record<string, unknown>>('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(data) });
}
