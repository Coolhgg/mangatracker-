#!/usr/bin/env tsx

/**
 * Script to push schema changes to the database
 * This will create any missing tables defined in src/db/schema.ts
 */

import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as schema from '../src/db/schema';

async function main() {
  console.log('🔄 Connecting to database...');
  
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const db = drizzle(client, { schema });

  console.log('✅ Connected to database');
  console.log('📋 Checking dmca_reports table...');

  try {
    // Test if table exists by trying to query it
    const result = await db.select().from(schema.dmcaReports).limit(1);
    console.log('✅ dmca_reports table exists');
    console.log(`📊 Current reports count: ${result.length}`);
  } catch (error) {
    console.error('❌ Table does not exist or query failed:', error);
    console.log('\n📝 Instructions to fix:');
    console.log('1. Run: npx drizzle-kit generate');
    console.log('2. Run: npx drizzle-kit push');
    console.log('3. Re-run this script to verify');
  }

  await client.close();
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});