import { requireAdmin } from '@/server/resources/auth/require-admin';
import { handleError, ok } from '@/server/common/utils/api-response';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() { try { const admin = await requireAdmin(); return ok({ id:admin.id, name:admin.name, email:admin.email }); } catch (error) { return handleError(error); } }
