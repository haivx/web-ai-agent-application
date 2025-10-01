import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface JobStatusParams {
  params: { id: string };
}

export async function GET(_request: Request, _context: JobStatusParams) {
  // TODO: Lookup job status from queue or database.
  return NextResponse.json({ status: 'completed', progress: 100 });
}
