import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@photo/db/src/client';

const QuerySchema = z.object({
  status: z
    .enum(['processed', 'queued', 'failed'])
    .optional()
    .default('processed'),
  limit: z.coerce.number().int().min(1).max(60).optional().default(24),
  cursor: z.string().uuid().optional(),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'BAD_REQUEST',
          message: 'Invalid query',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { status, limit, cursor } = parsed.data;

    const items = await prisma.image.findMany({
      where: { status },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' },
      ],
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        url: true,
        createdAt: true,
        status: true,
      },
    });

    let nextCursor: string | undefined;
    if (items.length > limit) {
      const next = items.pop();
      nextCursor = next?.id;
    }

    return NextResponse.json({ items, nextCursor });
  } catch (error) {
    console.error('[photos] error', error);
    return NextResponse.json(
      { code: 'INTERNAL', message: 'Failed to list photos' },
      { status: 500 }
    );
  }
}
