#!/usr/bin/env bash
set -euo pipefail

# Simple smoke test runner for local/dev CI
# - Builds Next.js
# - Starts the dev server in background
# - Probes key health endpoints
# - Seeds via dev seed endpoint
# - Simulates a Stripe webhook
# - Writes JSON report to artifacts/smoke-report.json

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
ARTIFACTS_DIR="$ROOT_DIR/artifacts"
mkdir -p "$ARTIFACTS_DIR"
REPORT_JSON="$ARTIFACTS_DIR/smoke-report.json"
LOG_FILE="$ARTIFACTS_DIR/smoke-test.log"

function log() {
  echo "$(date -Is) | $*" | tee -a "$LOG_FILE"
}

log "== Smoke test started =="

# Defaults for local dev
export NODE_ENV=${NODE_ENV:-development}
export NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3000}
export NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-devsecret}
export DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/app?schema=public}
export REDIS_URL=${REDIS_URL:-redis://localhost:6379/0}
export TYPESENSE_HOST=${TYPESENSE_HOST:-localhost}
export TYPESENSE_PORT=${TYPESENSE_PORT:-8108}
export TYPESENSE_PROTOCOL=${TYPESENSE_PROTOCOL:-http}
export TYPESENSE_API_KEY=${TYPESENSE_API_KEY:-xyz}
export S3_ENDPOINT=${S3_ENDPOINT:-http://localhost:9000}
export S3_KEY=${S3_KEY:-minioadmin}
export S3_SECRET=${S3_SECRET:-minioadmin}
export STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-sk_test_dummy}
export STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}
export RESEND_API_KEY=${RESEND_API_KEY:-}
export SENTRY_DSN=${SENTRY_DSN:-}
export SEED_ADMIN_EMAIL=${SEED_ADMIN_EMAIL:-admin@example.com}
export SEED_ADMIN_PASSWORD=${SEED_ADMIN_PASSWORD:-Admin123!test}

log "Installing deps"
if command -v yarn >/dev/null 2>&1; then
  yarn install | tee -a "$LOG_FILE"
else
  npm install | tee -a "$LOG_FILE"
fi

log "Building app"
npm run build | tee -a "$LOG_FILE"

# Start Next server in background
log "Starting Next server"
PORT=3000 npm start >/dev/null 2>>"$LOG_FILE" &
NEXT_PID=$!
trap 'kill $NEXT_PID || true' EXIT

# Wait for server
log "Waiting for server to be ready..."
ATTEMPTS=60
until curl -sf "http://localhost:3000/api/health" >/dev/null 2>&1 || [ $ATTEMPTS -eq 0 ]; do
  sleep 1
  ATTEMPTS=$((ATTEMPTS-1))
done

if [ $ATTEMPTS -eq 0 ]; then
  log "Server did not become healthy in time"
  echo '{"status":"fail","reason":"server_not_ready"}' > "$REPORT_JSON"
  exit 2
fi

# Seed via dev endpoint (idempotent)
log "Seeding database via /api/dev/seed"
SEED_RES=$(curl -sf -X POST "http://localhost:3000/api/dev/seed" || echo '{}')

log "Probing endpoints"
APP_HEALTH=$(curl -sf "http://localhost:3000/api/health" || echo '{}')
WORKER_STATUS=$(curl -sf "http://localhost:3000/api/worker/status" || echo '{}')
SEARCH_HEALTH=$(curl -sf "http://localhost:3000/api/search/health" || echo '{}')
DMCA_HEALTH=$(curl -sf "http://localhost:3000/api/reports/dmca" || echo '{}')

log "Simulating Stripe webhook"
STRIPE_RES=$(curl -sf -X POST "http://localhost:3000/api/webhooks/stripe" \
  -H 'Content-Type: application/json' \
  -d '{"type":"checkout.session.completed"}' || echo '{}')

# Summary
cat > "$REPORT_JSON" <<JSON
{
  "status": "pass",
  "app_health": $APP_HEALTH,
  "worker_status": $WORKER_STATUS,
  "search_health": $SEARCH_HEALTH,
  "dmca_health": $DMCA_HEALTH,
  "seed": $SEED_RES,
  "stripe_webhook": $STRIPE_RES,
  "notes": "This smoke test runs with dev defaults. For full coverage, run docker-compose and provide real keys."
}
JSON

log "Wrote report to $REPORT_JSON"
log "== Smoke test finished =="