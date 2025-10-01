import { PhotoDropzone } from '@/components/uploader/PhotoDropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlbumsSkeleton } from '@/components/gallery/AlbumsSkeleton';

export default function AlbumsPage() {
  return (
    <section className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Upload your photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoDropzone />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Albums</h2>
          <p className="text-sm text-neutral-400">Face grouping coming soon</p>
        </div>
        <AlbumsSkeleton />
      </div>
    </section>
  );
}
