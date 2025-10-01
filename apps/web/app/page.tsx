import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Organize your photos effortlessly</h1>
        <p className="text-neutral-300">
          Sprint 0 focuses on the upload and ingestion flow with mocked services. Head to the albums
          dashboard to try it out.
        </p>
      </header>
      <Button asChild>
        <Link href="/albums">Go to albums</Link>
      </Button>
    </section>
  );
}
