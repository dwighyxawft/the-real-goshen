import { getRunningEvents } from '@/server/resources/discounts/discounts.service';
import { handleError, ok, withCache } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export async function GET() { try { const events = await getRunningEvents(); const storeWide = events.filter((event) => event.scope === 'all').sort((a,b) => b.percentage - a.percentage)[0] ?? null; return withCache(ok({ items:events, storeWide }), 15); } catch (error) { return handleError(error); } }
