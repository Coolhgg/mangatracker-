# Kenmei Deployment Guide

Complete deployment instructions for Kenmei manga tracking platform with CI/CD, monitoring, and domain management.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Vercel Deployment (Frontend + API)](#vercel-deployment)
5. [Worker Deployment](#worker-deployment)
6. [Typesense Search Setup](#typesense-setup)
7. [Monitoring Setup](#monitoring-setup)
8. [Security Configuration](#security-configuration)
9. [Domain Management](#domain-management)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Testing](#testing)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js** 20.x or higher
- **GitHub** account for CI/CD
- **Vercel** account for frontend deployment
- **Fly.io** or **Railway** account for worker service
- **Supabase** or **Neon** account for PostgreSQL database
- **Stripe** account (test mode) for payments
- **PostHog** account for analytics
- **Sentry** account for error tracking
- **Upstash Redis** (optional) for rate limiting

---

## Environment Setup

### 1. Clone Required Environment Variables

Create `.env.production` file with the following variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# App Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production

# Authentication (Better-Auth)
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=https://yourdomain.com

# Payments (Stripe)
STRIPE_TEST_KEY=sk_test_...
STRIPE_LIVE_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
AUTUMN_SECRET_KEY=your-autumn-secret

# Search (Typesense)
TYPESENSE_API_KEY=your-typesense-api-key
TYPESENSE_HOST=your-typesense-host
NEXT_PUBLIC_TYPESENSE_HOST=https://your-typesense-host
NEXT_PUBLIC_TYPESENSE_SEARCH_KEY=search-only-key

# MangaDex Integration
MANGADEX_API_URL=https://api.mangadex.org

# Monitoring
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Rate Limiting (Optional - Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# SSL Configuration (Supabase)
SSL_CA_PATH=./src/certs/supabase-ca-bundle.crt
```

### 2. Generate Secrets

```bash
# Generate BETTER_AUTH_SECRET
openssl rand -base64 32

# Generate AUTUMN_SECRET_KEY
openssl rand -base64 32
```

---

## Database Setup

### Option A: Supabase (Recommended)

1. Create a new Supabase project
2. Go to **Settings** > **Database**
3. Copy the connection string (Transaction pooler)
4. Download SSL certificates:

```bash
# Download Supabase CA certificate
curl -o src/certs/supabase-ca-bundle.crt \
  https://supabase.com/dashboard/_/auth/v1/ca-certificate
```

5. Run migrations:

```bash
npm run db:migrate:deploy
```

6. Seed database:

```bash
npm run db:seed
```

### Option B: Neon

1. Create a new Neon project
2. Copy the connection string
3. Enable connection pooling
4. Run migrations and seed data as above

---

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Link Project

```bash
vercel link
```

### 3. Add Environment Variables

```bash
# Add all environment variables from .env.production
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_SITE_URL production
# ... add all other variables
```

### 4. Deploy

```bash
# Deploy to production
vercel --prod

# Or use the deployment script
npm run deploy
```

### 5. Configure Domain

1. Go to **Vercel Dashboard** > **Settings** > **Domains**
2. Add your custom domain
3. Configure DNS:
   - **Type**: CNAME
   - **Name**: @ or www
   - **Value**: cname.vercel-dns.com

---

## Worker Deployment

### Option A: Fly.io (Recommended)

1. Install Flyctl:

```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh
```

2. Login:

```bash
flyctl auth login
```

3. Create app:

```bash
flyctl apps create kenmei-worker
```

4. Set secrets:

```bash
flyctl secrets set \
  DATABASE_URL="your-database-url" \
  TYPESENSE_HOST="your-typesense-host" \
  TYPESENSE_API_KEY="your-api-key" \
  MANGADEX_API_URL="https://api.mangadex.org"
```

5. Deploy:

```bash
flyctl deploy --config infra/fly.toml
```

### Option B: Railway

1. Install Railway CLI:

```bash
npm install -g @railway/cli
```

2. Login:

```bash
railway login
```

3. Initialize project:

```bash
railway init
```

4. Add environment variables in Railway dashboard

5. Deploy:

```bash
railway up
```

---

## Typesense Setup

### Self-Hosted (Docker)

1. Deploy Typesense container:

```bash
cd infra
docker-compose up -d typesense
```

2. Create search collections:

```bash
curl -X POST 'http://localhost:8108/collections' \
  -H 'X-TYPESENSE-API-KEY: your-api-key' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "series",
    "fields": [
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "genres", "type": "string[]"},
      {"name": "status", "type": "string"}
    ]
  }'
```

3. Index existing data:

```bash
curl -X POST 'http://localhost:3000/api/search/reindex' \
  -H 'Authorization: Bearer your-admin-token'
```

### Typesense Cloud

1. Sign up at https://cloud.typesense.org
2. Create a cluster
3. Copy API key and host
4. Update environment variables
5. Index data as above

---

## Monitoring Setup

### PostHog Analytics

1. Sign up at https://posthog.com
2. Create a new project
3. Copy the API key
4. Add to environment variables:

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

5. PostHog is already integrated in `src/app/layout.tsx`

### Sentry Error Tracking

1. Sign up at https://sentry.io
2. Create a new Next.js project
3. Copy the DSN
4. Add to environment variables:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

5. Sentry configs are in:
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - `sentry.edge.config.ts`

### Health Monitoring

Set up uptime monitoring for:

- **Main App**: `https://yourdomain.com/api/health/db`
- **Worker**: `https://worker.fly.dev/health`
- **Typesense**: `https://typesense.yourdomain.com/health`

Recommended services:
- UptimeRobot (free)
- BetterUptime
- Pingdom

---

## Security Configuration

### Rate Limiting

1. Sign up for **Upstash Redis** (free tier available)
2. Create a Redis database
3. Copy REST URL and token
4. Add to environment variables

Rate limiting is automatically applied to:
- Auth endpoints: 5 requests per 15 minutes
- DMCA reports: 10 requests per minute
- API endpoints: 100 requests per minute

### CORS Configuration

CORS is configured in `src/lib/security-headers.ts`:

- **Production**: Only your domain
- **Development**: Localhost allowed

Update allowed origins if needed:

```typescript
const allowedOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,
  "https://yourdomain.com",
];
```

### Security Headers

Security headers are automatically applied:
- Content Security Policy
- HSTS
- X-Frame-Options
- X-Content-Type-Options

### Audit Logging

Admin actions are logged to `audit_logs` table:
- DMCA reviews
- Source trust changes
- Maintenance operations

Access logs:

```sql
SELECT * FROM audit_logs 
WHERE action LIKE 'admin.%' 
ORDER BY created_at DESC 
LIMIT 100;
```

---

## Domain Management

### Domain Rotation

Use the domain rotation script to change domains:

```bash
# Make script executable
chmod +x scripts/rotate_domain.sh

# Run script
./scripts/rotate_domain.sh kenmei.ac
```

The script will:
1. Update `.env` and `.env.production`
2. Update `vercel.json` configuration
3. Create redirect configuration
4. Provide DNS setup instructions

### Setting Up Redirects

After domain change, configure 301 redirects:

#### Cloudflare Workers

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  url.hostname = 'newdomain.com'
  return Response.redirect(url.toString(), 301)
}
```

#### Vercel

Add to `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://newdomain.com/:path*",
      "permanent": true,
      "host": "olddomain.com"
    }
  ]
}
```

### Post-Rotation Checklist

After DNS propagation (24-48 hours):

- [ ] Test new domain
- [ ] Verify old domain redirects
- [ ] Test authentication
- [ ] Test Stripe checkout
- [ ] Update Stripe webhook URLs
- [ ] Update OAuth redirect URIs
- [ ] Update marketing materials
- [ ] Notify users

---

## CI/CD Pipeline

### GitHub Actions Setup

1. Add GitHub secrets:

```bash
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Fly.io
FLY_API_TOKEN

# Database
DATABASE_URL
TEST_DATABASE_URL

# Production
PRODUCTION_URL
```

2. Workflows are configured in:
   - `.github/workflows/ci.yml` - CI pipeline
   - `.github/workflows/deploy-production.yml` - Production deployment

### CI Pipeline

Runs on every push and PR:

1. **Lint** - ESLint + TypeScript checks
2. **Test** - Unit and E2E tests
3. **Build** - Next.js build
4. **Deploy Preview** - Vercel preview deployment (PRs only)
5. **Smoke Tests** - Post-deploy health checks

### Production Deployment

Runs on push to `main`:

1. **Database Migration** - Run pending migrations
2. **Deploy Frontend** - Deploy to Vercel
3. **Deploy Worker** - Deploy to Fly.io
4. **Smoke Tests** - Verify health endpoints

### Manual Deployment

Trigger manual deployment:

```bash
# Via GitHub Actions
gh workflow run deploy-production.yml

# Or directly via Vercel
vercel --prod
```

---

## Testing

### E2E Tests with Playwright

Run E2E tests locally:

```bash
# Install Playwright
npx playwright install

# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run in UI mode
npx playwright test --ui
```

### Test Coverage

E2E tests cover:

1. **Authentication** (`auth.spec.ts`)
   - Login/Register flows
   - Validation
   - Error handling

2. **Series Management** (`series.spec.ts`)
   - Series listing
   - Series detail
   - Add to library

3. **Comments & Ratings** (`comments.spec.ts`)
   - Posting comments
   - Rating series
   - Reactions

4. **Payments** (`payments.spec.ts`)
   - Pricing page
   - Checkout flow
   - Billing portal

5. **Reading Progress** (`reading.spec.ts`)
   - Chapters listing
   - Mark as read
   - Progress tracking

### Smoke Tests

Run smoke tests after deployment:

```bash
./run_smoke_tests.sh
```

Smoke tests verify:
- Database connection
- API health endpoints
- Authentication
- Search functionality

---

## Troubleshooting

### Database Connection Issues

**Error**: SSL certificate verification failed

**Solution**:
```bash
# Download fresh SSL certificate
curl -o src/certs/supabase-ca-bundle.crt \
  https://supabase.com/dashboard/_/auth/v1/ca-certificate

# Or use IP address bypass
export DRIZZLE_DB_HOST_IP=123.45.67.89
```

### Deployment Failures

**Error**: Build failed on Vercel

**Solution**:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check for TypeScript errors: `npx tsc --noEmit`

### Worker Not Syncing

**Error**: Worker unable to fetch MangaDex data

**Solution**:
1. Check worker logs: `flyctl logs`
2. Verify MangaDex API is accessible
3. Check rate limiting
4. Restart worker: `flyctl apps restart kenmei-worker`

### Rate Limiting Issues

**Error**: 429 Too Many Requests

**Solution**:
1. Check Redis connection
2. Adjust rate limits in `src/lib/rate-limit.ts`
3. Add IP to whitelist if needed

### Search Not Working

**Error**: Typesense connection failed

**Solution**:
1. Check Typesense health: `curl http://typesense-host:8108/health`
2. Verify API key is correct
3. Reindex data: `POST /api/search/reindex`

---

## Production Checklist

Before going live:

### Infrastructure
- [ ] Database migrations run successfully
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] CDN enabled (Vercel automatic)

### Services
- [ ] Frontend deployed to Vercel
- [ ] Worker deployed to Fly.io
- [ ] Typesense running and indexed
- [ ] Database seeded with initial data

### Monitoring
- [ ] PostHog analytics working
- [ ] Sentry error tracking configured
- [ ] Uptime monitoring active
- [ ] Health endpoints responding

### Security
- [ ] Rate limiting enabled
- [ ] CORS configured
- [ ] Security headers applied
- [ ] Audit logging active

### Testing
- [ ] All E2E tests passing
- [ ] Smoke tests successful
- [ ] Payment flow tested (test mode)
- [ ] Authentication working

### Configuration
- [ ] Environment variables set
- [ ] Stripe webhooks configured
- [ ] OAuth redirect URIs updated
- [ ] Email notifications working

---

## Support

For issues or questions:

- **Documentation**: This file
- **GitHub Issues**: [Create an issue](https://github.com/yourorg/kenmei/issues)
- **Discord**: [Join community](https://discord.gg/kenmei)

---

## License

MIT License - See LICENSE file for details