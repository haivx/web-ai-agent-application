import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { env } from './env';

export const s3 = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});

const EXPIRES = 60 * 10; // 10 minutes

export async function getPresignedPutUrl(key: string, contentType: string) {
  const cmd = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: 'private',
  });
  return getSignedUrl(s3, cmd, { expiresIn: EXPIRES });
}

export async function getPresignedGetUrl(key: string) {
  const cmd = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, cmd, { expiresIn: EXPIRES });
}
