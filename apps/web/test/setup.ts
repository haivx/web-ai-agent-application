import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('sonner', () => {
  const toast = Object.assign(() => undefined, {
    success: () => undefined,
    error: () => undefined
  });

  return {
    Toaster: () => null,
    toast
  };
});
