export function makeJsonRequest(method: 'GET' | 'POST' | 'PUT', body?: unknown, url = 'http://localhost/mock'): Request {
  return new Request(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
}

export async function parseJson<T>(response: Response): Promise<{ status: number; data: T }> {
  return {
    status: response.status,
    data: (await response.json()) as T
  };
}
