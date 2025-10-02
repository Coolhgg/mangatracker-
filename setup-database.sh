#!/usr/bin/env bash
set -euo pipefail

# Database setup script for Supabase
# Downloads the SSL certificate and initializes the database schema

echo "🔧 Setting up database..."

# Certificate setup
CERT_DIR="src/certs"
CERT_FILE="$CERT_DIR/supabase-fullchain.pem"
CERT_URL="https://raw.githubusercontent.com/supabase/supabase/master/docker/volumes/db/pooler_server.crt"

mkdir -p "$CERT_DIR"
CERT_PATH="$CERT_DIR/supabase-fullchain.pem"
CERT_URL="https://raw.githubusercontent.com/supabase/supabase/master/docker/volumes/db/pooler_server.crt"

if [ ! -f "$CERT_PATH" ]; then
  echo "🔐 Downloading Supabase CA certificate..."
  mkdir -p "$CERT_DIR"
  curl -fsSL "$CERT_URL" -o "$CERT_PATH"
  echo "✅ Saved CA to $CERT_PATH"
else
  echo "ℹ️ Supabase CA already present at $CERT_PATH"
fi

# Optional: suggest env for CLI to reduce timeouts/hangs (not exported permanently)
export PGCONNECT_TIMEOUT=${PGCONNECT_TIMEOUT:-15}
export PGOPTIONS=${PGOPTIONS:-"-c statement_timeout=60000 -c lock_timeout=15000"}

# Seed database with idempotent Drizzle seeds
echo "🌱 Seeding database with minimal data..."
npm run db:seed:minimal

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. If large migrations hang, set DRIZZLE_DATABASE_URL to your unpooled 5432 URL before running drizzle-kit."
echo "2. Run: npx drizzle-kit generate && npx drizzle-kit push"
echo "3. Optionally run: npm run db:seed:corrected (adds extra demo data)"
echo "4. Start your development server: npm run dev"
echo "5. Test API endpoints: /api/health, /api/series, /api/stats?range=weekly"