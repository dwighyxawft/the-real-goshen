import { getPublicSettings } from '@/server/resources/settings/settings.service';
import { handleError, ok, withCache } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export async function GET() { try { return withCache(ok(await getPublicSettings())); } catch (error) { return handleError(error); } }
