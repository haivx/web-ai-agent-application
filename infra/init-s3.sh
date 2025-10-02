#!/usr/bin/env bash
set -euo pipefail

# Config
ENDPOINT_URL="${S3_ENDPOINT:-http://localhost:4566}"
BUCKET="${S3_BUCKET:-photos}"
REGION="${S3_REGION:-us-east-1}"

echo "[init-s3] Waiting for Localstack at ${ENDPOINT_URL}..."
# wait until localstack responds
for i in {1..60}; do
  if aws --endpoint-url "${ENDPOINT_URL}" s3 ls >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "[init-s3] Ensuring bucket s3://${BUCKET} exists..."
set +e
aws --endpoint-url "${ENDPOINT_URL}" s3api head-bucket --bucket "${BUCKET}" >/dev/null 2>&1
EXISTS=$?
set -e

if [ $EXISTS -ne 0 ]; then
  aws --endpoint-url "${ENDPOINT_URL}" s3api create-bucket \
    --bucket "${BUCKET}" \
    --region "${REGION}" \
    --create-bucket-configuration LocationConstraint="${REGION}" >/dev/null
  echo "[init-s3] Created bucket ${BUCKET}"
else
  echo "[init-s3] Bucket ${BUCKET} already exists"
fi

echo "[init-s3] Done."
