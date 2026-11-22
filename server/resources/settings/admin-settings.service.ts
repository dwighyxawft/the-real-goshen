import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { siteSettings } from '@/server/db/schema';
import { getPublicUrl } from '@/server/storage/r2';
import { deleteObject } from '@/server/storage/r2';

export async function getAdminSettings() { const row = await (await import('./settings.service')).getSettings(); return { ...row, heroImageUrl:row.heroImageKey ? getPublicUrl(row.heroImageKey) : null, aboutImageUrl:row.aboutImageKey ? getPublicUrl(row.aboutImageKey) : null }; }
export async function updateSettings(input: Partial<typeof siteSettings.$inferInsert>) { const current = await (await import('./settings.service')).getSettings(); const [updated] = await db.insert(siteSettings).values({ id:1, ...input }).onConflictDoUpdate({ target:siteSettings.id, set:input }).returning(); for (const key of ['heroImageKey','aboutImageKey'] as const) { const oldKey = current[key]; const newKey = updated[key]; if (oldKey && oldKey !== newKey) { try { await deleteObject(oldKey); } catch (error) { console.error('settings image cleanup failed', error); } } } return { ...updated, heroImageUrl:updated.heroImageKey ? getPublicUrl(updated.heroImageKey) : null, aboutImageUrl:updated.aboutImageKey ? getPublicUrl(updated.aboutImageKey) : null }; }
