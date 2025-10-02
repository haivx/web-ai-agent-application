import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

import { getPresignedGetUrl, getPresignedPutUrl } from '../../../lib/s3';

const bodySchema = z.object({
  count: z.number().int().min(1).max(200),
  contentTypes: z.array(z.string()),
});

const extensionMap: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

function deriveExtension(contentType: string): string | undefined {
  const mapped = extensionMap[contentType];
  if (mapped) {
    return mapped;
  }
  const parts = contentType.split('/');
  if (parts.length === 2 && parts[1]) {
    const sanitized = parts[1].toLowerCase();
    if (/^[a-z0-9.+-]+$/.test(sanitized)) {
      return sanitized;
    }
  }
  return undefined;
}

function buildKey(contentType: string, now: Date): string {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const base = `uploads/${year}/${month}/${day}`;
  const ext = deriveExtension(contentType);
  const suffix = ext ? `.${ext}` : '';
  return `${base}/${uuidv4()}${suffix}`;
}

// @auth: wire NextAuth later but do not block
export async function POST(request: NextRequest) {
  let parsed;
  try {
    const json = await request.json();
    parsed = bodySchema.parse(json);
  } catch (error) {
    return NextResponse.json(
      { code: 'bad_request', message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const { count, contentTypes } = parsed;

  if (contentTypes.length !== count) {
    return NextResponse.json(
      { code: 'bad_request', message: 'contentTypes length must match count.' },
      { status: 400 }
    );
  }

  if (contentTypes.some((type) => !type || !type.startsWith('image/'))) {
    return NextResponse.json(
      { code: 'bad_request', message: 'Only image content types are allowed.' },
      { status: 400 }
    );
  }

  console.log(`[api/uploads] ${request.method} count=${count}`);

  const now = new Date();

  try {
    const items = await Promise.all(
      contentTypes.map(async (contentType) => {
        const key = buildKey(contentType, now);
        const [putUrl, getUrl] = await Promise.all([
          getPresignedPutUrl(key, contentType),
          getPresignedGetUrl(key),
        ]);

        return { key, putUrl, getUrl, contentType };
      })
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error('[api/uploads] failed to create presigned URLs', error);
    return NextResponse.json(
      { code: 'internal_error', message: 'Failed to generate presigned URLs.' },
      { status: 500 }
    );
  }
}
