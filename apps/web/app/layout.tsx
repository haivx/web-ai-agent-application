import type { Metadata } from 'next';
import Link from 'next/link';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Photo Organizer',
  description: 'Sprint 0 placeholder UI for the Photo Organizer SaaS.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <Toaster richColors position="top-right" />
        <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-semibold">
              Photo Organizer
            </Link>
            <Link href="/albums" className="text-sm text-neutral-300 hover:text-white">
              Albums
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
