import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface AlbumParams {
  params: { id: string };
}

export async function GET(_request: Request, { params }: AlbumParams) {
  // TODO: Fetch album detail from persistent storage.
  return NextResponse.json({ clusterId: params.id, label: null, photos: [] });
}
