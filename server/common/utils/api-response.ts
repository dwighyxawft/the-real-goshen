import { NextResponse } from 'next/server';
import { HttpError } from './http-error';
export { HttpError } from './http-error';

export function ok<T>(data: T, status = 200): NextResponse { return NextResponse.json({ success: true, data }, { status }); }
export function fail(message: string, status = 400, details?: unknown): NextResponse { return NextResponse.json({ success: false, error: { message, ...(details === undefined ? {} : { details }) } }, { status }); }
export function handleError(error: unknown): NextResponse {
  if (error instanceof HttpError) return fail(error.message, error.status, error.details);
  console.error(error);
  return fail('Something went wrong. Please try again.', 500);
}
export function withCache(response: NextResponse, seconds = 60): NextResponse { response.headers.set('Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=300`); return response; }
