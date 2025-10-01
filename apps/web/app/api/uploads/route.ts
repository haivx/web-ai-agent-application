import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export const runtime = 'nodejs';

interface UploadRequest {
  count?: number;
  contentTypes?: string[];
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as UploadRequest;

  if (
    typeof payload.count !== 'number' ||
    payload.count <= 0 ||
    !Array.isArray(payload.contentTypes) ||
    payload.contentTypes.length === 0
  ) {
    return NextResponse.json(
      {
        error: 'Invalid payload: "count" and "contentTypes" are required.'
      },
      { status: 400 }
    );
  }

  const uploads = Array.from({ length: payload.count }, () => {
    const key = uuid();
    return {
      key,
      putUrl: `/api/mock-upload?key=${key}`,
      getUrl: `http://localhost/mock/${key}`
    };
  });

  return NextResponse.json(uploads);
}
