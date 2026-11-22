import { NextRequest } from 'next/server';
import { z } from 'zod';
import { HttpError } from './http-error';

export function getClientIp(req: Request): string { return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'; }
export async function parseJson<T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> { let body: unknown; try { body = await req.json(); } catch { throw new HttpError(400, 'Invalid JSON body'); } const result = schema.safeParse(body); if (!result.success) throw new HttpError(422, 'Please check the submitted fields.', result.error.flatten().fieldErrors); return result.data; }
export function parseQuery<T extends z.ZodTypeAny>(url: string, schema: T): z.infer<T> { const params = Object.fromEntries(new URL(url).searchParams.entries()); const result = schema.safeParse(params); if (!result.success) throw new HttpError(400, 'Invalid query parameters.', result.error.flatten().fieldErrors); return result.data; }
