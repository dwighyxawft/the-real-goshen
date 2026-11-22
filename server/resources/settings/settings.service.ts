import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { siteSettings } from '@/server/db/schema';
import { getPublicUrl } from '@/server/storage/r2';

export async function getSettings() { const found = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1); if (found[0]) return found[0]; const [created] = await db.insert(siteSettings).values({ id:1, defaultLeadTimeWeeksMin:4, defaultLeadTimeWeeksMax:8 }).returning(); return created; }
export async function getPublicSettings() { const settings = await getSettings(); return { whatsappNumber:settings.whatsappNumber, storeEmail:settings.storeEmail, instagramUrl:settings.instagramUrl, tiktokUrl:settings.tiktokUrl, facebookUrl:settings.facebookUrl, address:settings.address, businessHours:settings.businessHours, heroHeadline:settings.heroHeadline, heroSubheadline:settings.heroSubheadline, heroImageUrl:settings.heroImageKey ? getPublicUrl(settings.heroImageKey) : null, aboutBody:settings.aboutBody, aboutImageUrl:settings.aboutImageKey ? getPublicUrl(settings.aboutImageKey) : null, announcementText:settings.announcementText, announcementActive:settings.announcementActive, defaultLeadTimeWeeksMin:settings.defaultLeadTimeWeeksMin, defaultLeadTimeWeeksMax:settings.defaultLeadTimeWeeksMax, preorderNote:settings.preorderNote }; }
