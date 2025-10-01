import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function PUT(_request: Request) {
  // TODO: Store uploaded files in object storage.
  return NextResponse.json({ ok: true });
}
