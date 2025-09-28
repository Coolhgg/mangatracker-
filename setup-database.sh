#!/bin/bash

set -e

echo "🔧 Setting up database (Drizzle) ..."

# Seed database with idempotent Drizzle seeds
echo "🌱 Seeding database with minimal data..."
npm run db:seed:minimal

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Optionally run: npm run db:seed:corrected (adds extra demo data)"
echo "2. Start your development server: npm run dev"
echo "3. Test API endpoints: /api/health, /api/series, /api/stats?range=weekly"