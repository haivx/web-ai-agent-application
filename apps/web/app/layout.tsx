import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import QueryProvider from '@/components/QueryProvider';

export const metadata: Metadata = {
  title: 'Photo Organizer',
  description: 'Organize and explore your photos.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
