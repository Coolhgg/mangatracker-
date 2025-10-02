# Kenmei Sync Worker

Background worker service that syncs manga/manhwa data from external sources.

## Features

- Polls external APIs (MangaDex, AniList, Kitsu, WeebCentral) every 15 minutes
- Updates series metadata and chapter lists
- Maintains sync logs and source registry
- Exponential backoff on failures
- Graceful shutdown handling

## Setup

```bash
cd worker
npm install
```

## Running

### Development Mode
```bash
npm run dev
```

### Production with PM2
```bash
npm run pm2:start
npm run pm2:logs
npm run pm2:stop
```

### Direct Execution
```bash
npm start
```

## Environment Variables

Required:
- `TURSO_CONNECTION_URL` or `DATABASE_URL` - Database connection string
- `TURSO_AUTH_TOKEN` - Database auth token (for Turso)
- `NEXT_PUBLIC_SITE_URL` - API base URL (e.g., http://localhost:3000)
- `CRON_SECRET` - Secret for authenticating with sync API endpoints

## Monitoring

- Logs stored in `./logs/` directory
- View logs: `npm run pm2:logs`
- Check status: `pm2 status`
- Monitor dashboard: `pm2 monit`

## Manual Sync Trigger

You can manually trigger a sync via the API:

```bash
curl -X POST http://localhost:3000/api/admin/sync \
  -H "Content-Type: application/json" \
  -H "x-user-email: admin@example.com"