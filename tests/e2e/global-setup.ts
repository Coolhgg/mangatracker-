import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { execSync } from 'node:child_process';

// Playwright global setup: seed DB and prepare storage state with bearer_token
export default async function globalSetup() {
  try {
    // Use npm-run for broader portability across environments
    execSync('npm run -s db:seed:minimal', { stdio: 'inherit' });
  } catch (e) {
    // Keep tests running even if seed is already applied
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
}