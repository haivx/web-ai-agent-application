import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PhotoDropzone } from '@/components/uploader/PhotoDropzone';

const createJsonResponse = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init
  });

describe('PhotoDropzone', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles upload flow and displays progress updates', async () => {
    vi.useFakeTimers();
    const files = [
      new File(['file-1'], 'one.jpg', { type: 'image/jpeg' }),
      new File(['file-2'], 'two.jpg', { type: 'image/jpeg' }),
      new File(['file-3'], 'three.jpg', { type: 'image/jpeg' })
    ];

    const uploadTargets = files.map((_, index) => ({
      key: `key-${index}`,
      putUrl: `/api/mock-upload?key=key-${index}`,
      getUrl: `http://localhost/mock/key-${index}`
    }));

    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(createJsonResponse(uploadTargets))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(createJsonResponse({ jobId: '123e4567-e89b-12d3-a456-426614174000' }, { status: 202 }))
      .mockResolvedValue(createJsonResponse({ status: 'completed', progress: 100 }));

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTimeAsync });
    const { container } = render(<PhotoDropzone />);

    const input = container.querySelector('input[type="file"]');
    expect(input).toBeTruthy();

    await user.upload(input as HTMLInputElement, files);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/uploads', expect.any(Object));
    });

    await waitFor(() => expect(screen.getByText('100%')).toBeInTheDocument());

    await vi.advanceTimersByTimeAsync(1500);

    await waitFor(() => {
      expect(screen.getByText(/Job ID/)).toBeInTheDocument();
      expect(screen.getByText(/123e4567-e89b-12d3-a456-426614174000/)).toBeInTheDocument();
      expect(screen.getByText(/Status: completed/)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});
