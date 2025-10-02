import Redis from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';

declare global {
  // eslint-disable-next-line no-var
  var __redis__: Redis | undefined;
}

export const redis =
  global.__redis__ ??
  new Redis(url, {
    maxRetriesPerRequest: 3,
    enableAutoPipelining: true,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__redis__ = redis;
}
