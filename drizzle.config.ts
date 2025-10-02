import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';
import fs from 'fs';
import path from 'path';

// Prefer CA from env (inline or path), then supabase-fullchain.pem, then other fallbacks
const envCaInline = process.env.SSL_CA_CERT; // full PEM text
const envCaPath = process.env.SSL_CA_PATH;   // path to PEM file
const fullchainPath = path.resolve(process.cwd(), 'src/certs/supabase-fullchain.pem');
const bundledCaPath = path.resolve(process.cwd(), 'src/certs/supabase-ca-bundle.crt');

let ca: string | undefined;
try {
  if (envCaInline && envCaInline.trim()) {
    ca = envCaInline;
  } else if (envCaPath && fs.existsSync(envCaPath)) {
    ca = fs.readFileSync(envCaPath, 'utf8');
  } else if (fs.existsSync(fullchainPath)) {
    ca = fs.readFileSync(fullchainPath, 'utf8');
  } else if (fs.existsSync(bundledCaPath)) {
    ca = fs.readFileSync(bundledCaPath, 'utf8');
  }
} catch {
  // ignore, will fall back below
}

// Allow overriding DB URL used by drizzle-kit to target unpooled port if needed
const url = process.env.DRIZZLE_DATABASE_URL || process.env.DATABASE_URL!;

// Conservative defaults to reduce CLI hangs/timeouts
process.env.PGCONNECT_TIMEOUT = process.env.PGCONNECT_TIMEOUT || '15'; // seconds
process.env.DRIZZLE_LOG = process.env.DRIZZLE_LOG || 'true';

// Enforce CA presence for Supabase to avoid TLS handshakes that hang drizzle CLI
const isSupabase = /supabase\.(co|com)/i.test(url) || /pooler\.supabase\.com/i.test(url);

// NEW: Fail fast if using Supabase pooler host/port (causes TLS chain issues and timeouts)
try {
  const u = new URL(url);
  const host = u.hostname || '';
  const port = u.port || '';
  if (isSupabase && (host.includes('pooler.supabase.com') || port === '6543')) {
    throw new Error(
      "Detected Supabase pooler connection in drizzle.config.ts. Set DRIZZLE_DATABASE_URL to the unpooled host on port 5432 with '?sslmode=require' and provide SSL_CA_PATH=src/certs/supabase-fullchain.pem."
    );
  }
} catch {
  // ignore URL parse errors; drizzle will error later with clearer message
}

if (isSupabase && !ca) {
  throw new Error(
    'Supabase SSL CA not configured for drizzle-kit. Set SSL_CA_PATH to src/certs/supabase-fullchain.pem or SSL_CA_CERT with PEM contents.'
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url,
    // Always use strict verification with CA for Supabase; otherwise allow permissive only if explicitly desired
    ssl: ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false },
  },
}) satisfies Config;