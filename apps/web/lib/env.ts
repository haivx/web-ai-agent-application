export const env = {
  S3_ENDPOINT: process.env.S3_ENDPOINT ?? 'http://localhost:4566',
  S3_REGION: process.env.S3_REGION ?? 'us-east-1',
  S3_BUCKET: must('S3_BUCKET'),
  S3_ACCESS_KEY_ID: must('S3_ACCESS_KEY_ID'),
  S3_SECRET_ACCESS_KEY: must('S3_SECRET_ACCESS_KEY'),
};

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}
