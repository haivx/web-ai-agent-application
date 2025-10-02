import { NextResponse } from 'next/server';
import { redis } from '@/app/../../lib/redis';
import { prisma } from '@photo/db/src/client';

type JobState = {
  id: string;
  startedAt: number;
  total: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  finalized: boolean;
};

const DURATION_MS = 8000; // 8s to 100%

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const jobId = params.id;
  const jobKey = `job:${jobId}`;
  const raw = await redis.hgetall(jobKey);

  if (!raw || Object.keys(raw).length === 0) {
    return NextResponse.json({ code: 'NOT_FOUND', message: 'Job not found' }, { status: 404 });
  }

  const job: JobState = {
    id: raw.id,
    startedAt: Number(raw.startedAt),
    total: Number(raw.total),
    status: (raw.status as JobState['status']) || 'running',
    finalized: raw.finalized === '1',
  };

  const now = Date.now();
  const elapsed = Math.max(0, now - job.startedAt);
  const progress = Math.min(100, Math.floor((elapsed / DURATION_MS) * 100));
  let status: JobState['status'] = progress >= 100 ? 'completed' : 'running';

  // Once completed first time, mark finalized and persist images as processed
  if (status === 'completed' && !job.finalized) {
    // Update finalized flag
    await redis.hset(jobKey, { finalized: '1', status: 'completed' });

    // Mark all 'queued' images as processed for demo purposes.
    // In a real pipeline, we'd scope to this job's images (store keys on job).
    await prisma.image.updateMany({
      where: { status: 'queued' },
      data: { status: 'processed' },
    });
  }

  return NextResponse.json({ status, progress });
}
