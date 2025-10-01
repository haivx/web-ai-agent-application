#!/usr/bin/env bash
set -euo pipefail

SERVICES=(db redis mcp)

docker compose up -d "${SERVICES[@]}"

timeout=60
interval=3
elapsed=0

while (( elapsed < timeout )); do
  all_healthy=true
  for service in "${SERVICES[@]}"; do
    status=$(docker inspect --format='{{json .State.Health.Status}}' "$(basename "${PWD}")_${service}_1" 2>/dev/null || echo '"starting"')
    if [[ ${status} != "\"healthy\"" ]]; then
      all_healthy=false
      break
    fi
  done

  if ${all_healthy}; then
    echo "All services are healthy."
    exit 0
  fi

  sleep ${interval}
  elapsed=$(( elapsed + interval ))
done

echo "Timed out waiting for services to become healthy." >&2
exit 1
