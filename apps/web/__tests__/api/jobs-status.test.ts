import { describe, expect, it } from 'vitest';
import { GET as jobStatusGET } from '@/app/api/jobs/[id]/status/route';
import { makeJsonRequest, parseJson } from '@/test/helpers/next';

describe('GET /api/jobs/:id/status', () => {
  it('returns completed status', async () => {
    const response = await jobStatusGET(makeJsonRequest('GET'));
    const { status, data } = await parseJson<{ status: string; progress: number }>(response);

    expect(status).toBe(200);
    expect(data.status).toBe('completed');
    expect(data.progress).toBe(100);
  });
});
