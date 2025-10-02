'use client';

import * as React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

type Photo = { id: string; url: string; createdAt: string; status: string };
type Page = { items: Photo[]; nextCursor?: string };

type FetchPageArgs = {
  cursor?: string;
  signal?: AbortSignal;
};

async function fetchPage({ cursor, signal }: FetchPageArgs): Promise<Page> {
  const qs = new URLSearchParams();
  if (cursor) {
    qs.set('cursor', cursor);
  }
  const queryString = qs.toString();
  const url = queryString ? `/api/photos?${queryString}` : '/api/photos';
  const res = await fetch(url, { cache: 'no-store', signal });
  if (!res.ok) {
    throw new Error('Failed to load photos');
  }
  return res.json();
}

export default function GalleryPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['photos'],
    queryFn: ({ pageParam, signal }) =>
      fetchPage({ cursor: pageParam as string | undefined, signal }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const photos = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <main style={{ maxWidth: 1140, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>All Photos</h1>

      {isLoading && <SkeletonGrid count={12} />}

      {isError && (
        <p style={{ color: 'red' }}>{error instanceof Error ? error.message : 'Error'}</p>
      )}

      {!isLoading && photos.length === 0 && (
        <p style={{ marginTop: 12, color: '#666' }}>Chưa có ảnh đã xử lý.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 8,
          marginTop: 16,
        }}
      >
        {photos.map((photo) => (
          <figure
            key={photo.id}
            style={{ margin: 0, position: 'relative', overflow: 'hidden', borderRadius: 8 }}
          >
            <img
              src={photo.url}
              alt="Photo"
              style={{
                width: '100%',
                height: 160,
                objectFit: 'cover',
                display: 'block',
                background: '#f2f2f2',
              }}
              loading="lazy"
            />
            <figcaption style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {new Date(photo.createdAt).toLocaleString()}
            </figcaption>
          </figure>
        ))}
      </div>

      <div ref={sentinelRef} style={{ height: 1 }} />

      {isFetchingNextPage && <SkeletonGrid count={6} />}

      {!hasNextPage && photos.length > 0 && (
        <div style={{ textAlign: 'center', color: '#666', fontSize: 12, marginTop: 12 }}>— hết —</div>
      )}
    </main>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 8,
        marginTop: 16,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} style={{ height: 160, background: '#eee', borderRadius: 8 }} />
      ))}
    </div>
  );
}
