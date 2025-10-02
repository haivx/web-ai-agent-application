import Uploader from '../../components/Uploader';

export default function UploadPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '1rem' }}>Upload images</h1>
      <p style={{ marginBottom: '2rem', color: '#555' }}>
        Use the uploader below to send images directly to S3 via presigned URLs. Start Localstack
        and run <code>pnpm infra:up</code> before testing.
      </p>
      <Uploader />
    </main>
  );
}
