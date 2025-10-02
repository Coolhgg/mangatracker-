import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { execSync } from 'node:child_process';

// Playwright global setup: seed DB and prepare storage state with bearer_token
export default async function globalSetup() {
  console.log('[global-setup] Starting API health checks and setup...');

  // Step 1: Check API health
  try {
    console.log('[global-setup] Checking database health...');
    const healthResult = execSync('curl -sS http://localhost:3000/api/health/db', { encoding: 'utf8' });
    console.log('[global-setup] Health check result:', healthResult);
  } catch (e) {
    console.warn('[global-setup] Health check failed, continuing...', e);
  }

  // Step 2: Seed the database
  try {
    console.log('[global-setup] Seeding database...');
    const seedResult = execSync('ALLOW_DEV_SEED=true curl -sS -X POST http://localhost:3000/api/dev/seed', { encoding: 'utf8' });
    console.log('[global-setup] Seed result:', seedResult);
  } catch (e) {
    console.warn('[global-setup] Seed failed or already applied, continuing...', e);
  }

  // Step 3: Setup Supabase
  try {
    console.log('[global-setup] Setting up Supabase storage...');
    const supabaseResult = execSync('ALLOW_DEV_SUPABASE_SETUP=true curl -sS -X POST http://localhost:3000/api/dev/supabase/setup', { encoding: 'utf8' });
    console.log('[global-setup] Supabase setup result:', supabaseResult);
  } catch (e) {
    console.warn('[global-setup] Supabase setup failed or skipped, continuing...', e);
  }

  // Fallback: Use npm-run for broader portability across environments
  try {
    execSync('npm run -s db:seed:minimal', { stdio: 'inherit' });
  } catch (e) {
    console.warn('[global-setup] db:seed:minimal failed or already applied. Continuing...');
  }

  const storagePath = 'tests/.auth/state.json';
  const dir = dirname(storagePath);
  mkdirSync(dir, { recursive: true });

  // Minimal storage state with localStorage bearer_token for localhost:3000
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:3000',
        localStorage: [
          { name: 'bearer_token', value: '1' },
        ],
      },
    ],
  } as const;

  writeFileSync(storagePath, JSON.stringify(storageState, null, 2));
  console.log(`[global-setup] Wrote storage state to ${storagePath}`);
  console.log('[global-setup] Setup complete! ✅');
}