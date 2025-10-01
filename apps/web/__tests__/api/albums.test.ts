import { describe, expect, it } from 'vitest';
import { GET as albumsGET } from '@/app/api/albums/route';
import { GET as albumGET } from '@/app/api/albums/[id]/route';
import { makeJsonRequest, parseJson } from '@/test/helpers/next';

describe('GET /api/albums', () => {
  it('returns empty list for sprint 0', async () => {
    const response = await albumsGET(makeJsonRequest('GET'));
    const { status, data } = await parseJson<unknown[]>(response);

    expect(status).toBe(200);
    expect(data).toEqual([]);
  });
});

describe('GET /api/albums/:id', () => {
  it('returns empty album placeholder', async () => {
    const response = await albumGET(makeJsonRequest('GET'), { params: { id: 'cluster-1' } });
    const { status, data } = await parseJson<{ clusterId: string; label: string | null; photos: unknown[] }>(response);

    expect(status).toBe(200);
    expect(data.clusterId).toBe('cluster-1');
    expect(data.photos).toEqual([]);
  });
});
