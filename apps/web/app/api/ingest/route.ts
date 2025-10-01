import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export const runtime = 'nodejs';

interface IngestRequest {
  photos?: Array<{ key: string; url: string }>;
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as IngestRequest;

  if (!Array.isArray(payload.photos) || payload.photos.length === 0) {
    return NextResponse.json({ error: 'Invalid payload: "photos" is required.' }, { status: 400 });
  }

  const jobId = uuid();
  // TODO: Enqueue ingest job in background worker.
  return NextResponse.json({ jobId }, { status: 202 });
}
