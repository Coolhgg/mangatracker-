#!/usr/bin/env node
/**
 * Background sync worker for Kenmei
 * Polls external sources (MangaDex, AniList, Kitsu, etc.) every 15 minutes
 * Updates series metadata and chapters in the database
 */

import { createClient } from '@libsql/client';

const DB_URL = process.env.TURSO_CONNECTION_URL || process.env.DATABASE_URL || '';
const DB_TOKEN = process.env.TURSO_AUTH_TOKEN;
const API_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

const db = createClient({
  url: DB_URL,
  authToken: DB_TOKEN,
});

interface Source {
  id: number;
  name: string;
  domain: string;
  enabled: boolean;
  lastChecked?: string;
}

interface SyncResult {
  sourceId: number;
  status: 'success' | 'partial' | 'failed';
  seriesSynced: number;
  chaptersSynced: number;
  errorMessage?: string;
  durationMs: number;
}

async function getEnabledSources(): Promise<Source[]> {
  try {
    const result = await db.execute(
      'SELECT id, name, domain, enabled, last_checked FROM sources WHERE enabled = 1'
    );
    return result.rows as any[];
  } catch (error) {
    console.error('Failed to fetch sources:', error);
    return [];
  }
}

async function syncSource(source: Source): Promise<SyncResult> {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();
  
  console.log(`[${startedAt}] Starting sync for ${source.name} (${source.domain})`);
  
  try {
    // Call the API endpoint to trigger sync
    const response = await fetch(`${API_BASE}/api/sync/source/${source.id}/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': process.env.CRON_SECRET || '',
      },
      body: JSON.stringify({ full: false }),
    });

    const durationMs = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        sourceId: source.id,
        status: 'failed',
        seriesSynced: 0,
        chaptersSynced: 0,
        errorMessage: data.error || `HTTP ${response.status}`,
        durationMs,
      };
    }

    // Log the sync result
    await logSyncResult({
      sourceId: source.id,
      status: data.status || 'success',
      seriesSynced: data.seriesSynced || 0,
      chaptersSynced: data.chaptersSynced || 0,
      durationMs,
      startedAt,
    });

    // Update last_checked timestamp
    await db.execute({
      sql: 'UPDATE sources SET last_checked = ?, updated_at = ? WHERE id = ?',
      args: [new Date().toISOString(), new Date().toISOString(), source.id],
    });

    return {
      sourceId: source.id,
      status: 'success',
      seriesSynced: data.seriesSynced || 0,
      chaptersSynced: data.chaptersSynced || 0,
      durationMs,
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error?.message || 'Unknown error';
    
    await logSyncResult({
      sourceId: source.id,
      status: 'failed',
      seriesSynced: 0,
      chaptersSynced: 0,
      errorMessage,
      durationMs,
      startedAt,
    });

    return {
      sourceId: source.id,
      status: 'failed',
      seriesSynced: 0,
      chaptersSynced: 0,
      errorMessage,
      durationMs,
    };
  }
}

async function logSyncResult(result: {
  sourceId: number;
  status: string;
  seriesSynced: number;
  chaptersSynced: number;
  errorMessage?: string;
  durationMs: number;
  startedAt: string;
}) {
  try {
    await db.execute({
      sql: `
        INSERT INTO sync_logs 
        (source_id, status, series_synced, chapters_synced, error_message, started_at, completed_at, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        result.sourceId,
        result.status,
        result.seriesSynced,
        result.chaptersSynced,
        result.errorMessage || null,
        result.startedAt,
        new Date().toISOString(),
        JSON.stringify({ durationMs: result.durationMs }),
      ],
    });
  } catch (error) {
    console.error('Failed to log sync result:', error);
  }
}

async function syncAllSources() {
  console.log('\n=== Starting sync cycle ===');
  const sources = await getEnabledSources();
  
  if (sources.length === 0) {
    console.log('No enabled sources found');
    return;
  }

  console.log(`Found ${sources.length} enabled source(s)`);

  const results = await Promise.allSettled(
    sources.map(source => syncSource(source))
  );

  const successful = results.filter(r => r.status === 'fulfilled' && (r.value as SyncResult).status === 'success').length;
  const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && (r.value as SyncResult).status === 'failed')).length;

  console.log(`\n=== Sync cycle complete ===`);
  console.log(`Successful: ${successful}, Failed: ${failed}`);
}

// Main worker loop
async function main() {
  console.log('🚀 Kenmei Sync Worker Started');
  console.log(`Sync interval: ${SYNC_INTERVAL_MS / 1000 / 60} minutes`);
  console.log(`API Base: ${API_BASE}\n`);

  // Initial sync on startup
  await syncAllSources();

  // Schedule periodic syncs
  setInterval(async () => {
    await syncAllSources();
  }, SYNC_INTERVAL_MS);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⏹️  Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⏹️  Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Start the worker
main().catch((error) => {
  console.error('Fatal error in sync worker:', error);
  process.exit(1);
});