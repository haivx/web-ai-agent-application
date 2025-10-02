import Uploader from '@/components/Uploader';

export default function UploadPage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Upload & Ingest</h1>
      <p style={{ color: '#666', marginTop: 8 }}>
        Hãy chạy <code>pnpm infra:up</code> trước. Sau khi upload, hệ thống sẽ giả lập xử lý (~8s).
      </p>
      <div style={{ marginTop: 16 }}>
        <Uploader />
      </div>
    </main>
  );
}
