import { getStaleInterests } from '@/server/resources/interests/admin-interests.service';
import { handleError } from '@/server/common/utils/api-response';
import { env } from '@/server/common/utils/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const secret = url.searchParams.get('secret');
    if (!env.CRON_SECRET || secret !== env.CRON_SECRET) {
      return new Response(JSON.stringify({ success: false, error: { message: 'Unauthorized' } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const result = await getStaleInterests();
    return Response.json({ success: true, data: result });
  } catch (error) {
    return handleError(error);
  }
}
