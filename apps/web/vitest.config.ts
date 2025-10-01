import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./test/setup.ts'],
    include: ['__tests__/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    environmentMatchGlobs: [
      ['__tests__/api/**', 'node']
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      lines: 80
    }
  }
});
