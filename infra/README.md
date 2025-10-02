# Dev Infra (Docker Compose)

Services:
- **Postgres**: `localhost:5432` (db=`photo`, user=`postgres`, pass=`postgres`)
- **Redis**: `localhost:6379`
- **Localstack (S3)**: `http://localhost:4566`

## Quick start
```bash
pnpm compose:up
pnpm s3:init     # creates S3 bucket (default: photos)
# or one-shot:
pnpm infra:up

Useful checks
# Postgres
PGPASSWORD=postgres psql -h localhost -U postgres -d photo -c '\dt'

# Redis
redis-cli -h localhost ping

# S3 via AWS CLI (requires awscli)
aws --endpoint-url http://localhost:4566 s3 ls
aws --endpoint-url http://localhost:4566 s3 ls s3://$S3_BUCKET

Tear down
pnpm compose:down


**Update root `package.json`** (add scripts under `"scripts"`)
```json
{
  "scripts": {
    "compose:up": "docker compose -f infra/docker-compose.dev.yml up -d",
    "compose:down": "docker compose -f infra/docker-compose.dev.yml down -v",
    "s3:init": "bash ./infra/init-s3.sh",
    "infra:up": "pnpm compose:up && pnpm s3:init"
  }
}


Update root .env.example (append if missing)

# Redis
REDIS_URL=redis://localhost:6379

# S3 (Localstack)
S3_ENDPOINT=http://localhost:4566
S3_REGION=us-east-1
S3_BUCKET=photos
S3_ACCESS_KEY_ID=test
S3_SECRET_ACCESS_KEY=test
