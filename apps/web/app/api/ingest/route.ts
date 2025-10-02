import { NextResponse } from 'next/server';
import { z } from 'zod';
import { redis } from '@/app/../lib/redis';
import { prisma } from '@photo/db/src/client';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 18);

const BodySchema = z.object({
  photos: z
    .array(
      z.object({
        key: z.string().min(3),
        contentType: z.string().regex(/^image\//),
      })
    )
    .min(1)
    .max(500),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'BAD_REQUEST', message: 'Invalid body', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { photos } = parsed.data;

    // Persist images as queued (idempotent per key+user later; for now by key only)
    // Note: userId is placeholder for now; wire NextAuth later.
    const userId = '00000000-0000-0000-0000-000000000001';

    // Basic URL composer for later preview (signed GET better; for now keep storageKey+url same)
    const s3Endpoint = process.env.S3_ENDPOINT ?? 'http://localhost:4566';
    const bucket = process.env.S3_BUCKET ?? 'photos';

    // Upsert images
    for (const p of photos) {
      const storageKey = p.key;
      const url = `${s3Endpoint}/${bucket}/${encodeURIComponent(storageKey)}`;
      await prisma.image.upsert({
        where: {
          // we don't have unique by storageKey; emulate with composite unique if needed.
          // For now, create a deterministic id from key hash would be nicer; keep simple: findFirst then create.
          id: crypto.randomUUID(),
        },
        update: {},
        create: {
          userId,
          storageKey,
          url,
          status: 'queued',
        },
      });
    }

    // Create a job in Redis
    const jobId = nanoid();
    const startedAt = Date.now();
    const total = photos.length;

    const jobKey = `job:${jobId}`;
    await redis.hmset(jobKey, {
      id: jobId,
      startedAt: String(startedAt),
      total: String(total),
      status: 'running',
      // mark not finalized
      finalized: '0',
    });
    await redis.expire(jobKey, 60 * 10); // 10 minutes TTL

    return NextResponse.json({ jobId }, { status: 202 });
  } catch (err) {
    console.error('[ingest] error', err);
    return NextResponse.json({ code: 'INTERNAL', message: 'Failed to start ingest' }, { status: 500 });
  }
}
