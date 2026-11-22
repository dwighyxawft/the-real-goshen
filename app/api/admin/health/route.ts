import { env } from '@/server/common/utils/env';
import { requireAdmin } from '@/server/resources/auth/require-admin';
import { handleError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs'; export const dynamic = 'force-dynamic';
export async function GET() { try { await requireAdmin(); const siteUrlIsPublic = !env.NEXT_PUBLIC_SITE_URL.includes('localhost') && !env.NEXT_PUBLIC_SITE_URL.includes('127.0.0.1'); return ok({ db:true, emailBrevo:Boolean(env.BREVO_API_KEY), emailResend:Boolean(env.RESEND_API_KEY), storage:Boolean(env.R2_BUCKET_NAME), siteUrl:Boolean(env.NEXT_PUBLIC_SITE_URL), siteUrlIsPublic }); } catch(error) { return handleError(error); } }
