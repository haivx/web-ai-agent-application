import { describe, expect, it } from 'vitest';
import { PUT as mockUploadPUT } from '@/app/api/mock-upload/route';

import { makeJsonRequest, parseJson } from '@/test/helpers/next';

describe('PUT /api/mock-upload', () => {
  it('returns ok true for any payload', async () => {
    const response = await mockUploadPUT(makeJsonRequest('PUT', { foo: 'bar' }));
    const { status, data } = await parseJson<{ ok: boolean }>(response);

    expect(status).toBe(200);
    expect(data.ok).toBe(true);
  });
});
