import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { env } from '@/server/common/utils/env';

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET_NAME) {
    throw new Error('Cloudflare R2 is not configured');
  }

  client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
  return client;
}

export interface UploadedObject {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

export function getPublicUrl(key: string): string {
  if (!env.R2_PUBLIC_URL) throw new Error('R2_PUBLIC_URL is not set');
  return `${env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
}

export async function uploadImage(
  file: { buffer: Buffer; contentType: string; size?: number },
  folder: 'products' | 'blog' | 'site',
): Promise<UploadedObject> {
  const ext = ALLOWED_TYPES[file.contentType];
  if (!ext) throw new Error('Only JPG, PNG, WebP or AVIF images are allowed');

  const size = file.size ?? file.buffer.byteLength;
  if (size > MAX_IMAGE_BYTES) throw new Error('Image is larger than 4MB');

  const key = `${folder}/${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  await getClient().send(new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  }));

  return { key, url: getPublicUrl(key), contentType: file.contentType, size };
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key }));
}

export async function deleteObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await getClient().send(new DeleteObjectsCommand({
    Bucket: env.R2_BUCKET_NAME,
    Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
  }));
}
