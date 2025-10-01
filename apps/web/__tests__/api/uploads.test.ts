import { describe, expect, it } from 'vitest';
import { POST as uploadsPOST } from '@/app/api/uploads/route';
import { makeJsonRequest, parseJson } from '@/test/helpers/next';

describe('POST /api/uploads', () => {
  it('returns 400 when payload is invalid', async () => {
    const response = await uploadsPOST(makeJsonRequest('POST', {}));
    const { status, data } = await parseJson<{ error: string }>(response);

    expect(status).toBe(400);
    expect(data.error).toMatch(/count|contentTypes/);
  });

  it('returns upload targets when payload is valid', async () => {
    const response = await uploadsPOST(
      makeJsonRequest('POST', { count: 3, contentTypes: ['image/jpeg'] })
    );

    const { status, data } = await parseJson<Array<{ key: string; putUrl: string; getUrl: string }>>(response);

    expect(status).toBe(200);
    expect(data).toHaveLength(3);
    for (const item of data) {
      expect(item.key).toBeTruthy();
      expect(item.putUrl).toMatch(/^\/api\/mock-upload\?key=/);
      expect(item.getUrl).toMatch(/^http:\/\/localhost\/mock\//);
    }
  });
});
