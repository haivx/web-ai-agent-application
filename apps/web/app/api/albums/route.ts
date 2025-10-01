import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(_request: Request) {
  // TODO: Fetch albums from persistent storage.
  return NextResponse.json([]);
}
