import { describe, expect, it } from 'vitest';
import { POST as ingestPOST } from '@/app/api/ingest/route';
import { makeJsonRequest, parseJson } from '@/test/helpers/next';

const uuidRegex =
  /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;

describe('POST /api/ingest', () => {
  it('returns 400 when photos are missing', async () => {
    const response = await ingestPOST(makeJsonRequest('POST', {}));
    const { status, data } = await parseJson<{ error: string }>(response);

    expect(status).toBe(400);
    expect(data.error).toMatch(/photos/);
  });

  it('returns a job id when payload is valid', async () => {
    const response = await ingestPOST(
      makeJsonRequest('POST', {
        photos: [{ key: 'key-1', url: 'http://localhost/mock/key-1' }]
      })
    );

    const { status, data } = await parseJson<{ jobId: string }>(response);

    expect(status).toBe(202);
    expect(data.jobId).toMatch(uuidRegex);
  });
});
