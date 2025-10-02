/**
 * Sync Service - Background worker for pulling data from external sources
 * Implements queue-based sync with exponential backoff
 */

import { db } from '@/db';
import { sources, syncLogs, series, mangaChapters } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { MangaDexConnector } from '@/lib/connectors/mangadex';

interface SyncJob {
  sourceId: number;
  full: boolean; // full sync vs incremental
}

export class SyncService {
  private queue: SyncJob[] = [];
  private processing = false;
  private retryDelays = new Map<number, number>(); // sourceId -> delay in ms

  constructor() {}

  /**
   * Schedule a sync job
   */
  async scheduleSyncJob(sourceId: number, full = false) {
    this.queue.push({ sourceId, full });
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process the sync queue
   */
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) continue;

      // Check backoff delay
      const delay = this.retryDelays.get(job.sourceId) || 0;
      if (delay > 0) {
        console.log(`[sync] Backoff delay for source ${job.sourceId}: ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        await this.syncSource(job.sourceId, job.full);
        // Reset backoff on success
        this.retryDelays.delete(job.sourceId);
      } catch (error) {
        console.error(`[sync] Error syncing source ${job.sourceId}:`, error);
        // Apply exponential backoff
        const currentDelay = this.retryDelays.get(job.sourceId) || 1000;
        this.retryDelays.set(job.sourceId, Math.min(currentDelay * 2, 60000)); // Max 60s
      }
    }
    
    this.processing = false;
  }

  /**
   * Sync a single source
   */
  private async syncSource(sourceId: number, full: boolean) {
    const startedAt = new Date().toISOString();
    let status: 'success' | 'partial' | 'failed' = 'failed';
    let seriesSynced = 0;
    let chaptersSynced = 0;
    let errorMessage: string | undefined;

    try {
      // Fetch source details
      const [source] = await db.select().from(sources).where(eq(sources.id, sourceId));
      if (!source || !source.enabled) {
        throw new Error(`Source ${sourceId} not found or disabled`);
      }

      console.log(`[sync] Starting sync for ${source.name} (${source.domain})`);

      // Currently only MangaDex is implemented
      if (source.domain.includes('mangadex')) {
        const result = await this.syncMangaDex(full);
        seriesSynced = result.seriesSynced;
        chaptersSynced = result.chaptersSynced;
        status = 'success';
      } else {
        throw new Error(`No connector available for ${source.domain}`);
      }

      // Update source last_checked
      await db.update(sources)
        .set({ 
          lastChecked: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(sources.id, sourceId));

    } catch (error: any) {
      errorMessage = error.message || 'Unknown error';
      status = 'failed';
      console.error(`[sync] Failed to sync source ${sourceId}:`, error);
    }

    // Log sync result
    await db.insert(syncLogs).values({
      sourceId,
      status,
      seriesSynced,
      chaptersSynced,
      errorMessage,
      startedAt,
      completedAt: new Date().toISOString(),
      metadata: { full },
    });

    console.log(`[sync] Completed sync for source ${sourceId}: ${status} (${seriesSynced} series, ${chaptersSynced} chapters)`);
  }

  /**
   * Sync MangaDex data
   */
  private async syncMangaDex(full: boolean): Promise<{ seriesSynced: number; chaptersSynced: number }> {
    let seriesSynced = 0;
    let chaptersSynced = 0;

    try {
      // Fetch series list (first page only for now)
      const seriesList = await MangaDexConnector.fetchSeriesList({ page: 1, limit: full ? 100 : 20 });
      
      for (const item of seriesList) {
        try {
          // Check if series already exists
          const existing = await db.select()
            .from(series)
            .where(eq(series.sourceUrl, `https://mangadex.org/title/${item.id}`))
            .limit(1);

          const now = new Date().toISOString();
          const slug = this.generateSlug(item.title);

          if (existing.length === 0) {
            // Insert new series
            const [newSeries] = await db.insert(series).values({
              slug,
              title: item.title,
              description: item.description,
              coverImageUrl: item.coverUrl,
              sourceName: 'MangaDex',
              sourceUrl: `https://mangadex.org/title/${item.id}`,
              tags: item.tags || [],
              status: 'ongoing',
              createdAt: now,
              updatedAt: now,
            }).returning();

            seriesSynced++;

            // Fetch and insert chapters
            const chapters = await MangaDexConnector.fetchChapters(item.id, { page: 1, limit: 50 });
            for (const chapter of chapters) {
              try {
                await db.insert(mangaChapters).values({
                  seriesId: newSeries.id,
                  number: chapter.number || 0,
                  title: chapter.title,
                  language: 'en',
                  publishedAt: chapter.publishedAt,
                  externalId: chapter.id,
                  sourceId: 'mangadex',
                  createdAt: now,
                }).onConflictDoNothing();
                chaptersSynced++;
              } catch (e) {
                console.error(`[sync] Error inserting chapter ${chapter.id}:`, e);
              }
            }
          } else {
            // Update existing series
            await db.update(series)
              .set({
                title: item.title,
                description: item.description,
                coverImageUrl: item.coverUrl,
                tags: item.tags || [],
                updatedAt: now,
              })
              .where(eq(series.id, existing[0].id));

            // Optionally fetch new chapters
            if (full) {
              const chapters = await MangaDexConnector.fetchChapters(item.id, { page: 1, limit: 50 });
              for (const chapter of chapters) {
                try {
                  await db.insert(mangaChapters).values({
                    seriesId: existing[0].id,
                    number: chapter.number || 0,
                    title: chapter.title,
                    language: 'en',
                    publishedAt: chapter.publishedAt,
                    externalId: chapter.id,
                    sourceId: 'mangadex',
                    createdAt: now,
                  }).onConflictDoNothing();
                  chaptersSynced++;
                } catch (e) {
                  console.error(`[sync] Error inserting chapter ${chapter.id}:`, e);
                }
              }
            }
          }
        } catch (e) {
          console.error(`[sync] Error processing series ${item.id}:`, e);
        }
      }
    } catch (error) {
      console.error('[sync] MangaDex sync error:', error);
      throw error;
    }

    return { seriesSynced, chaptersSynced };
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100);
  }
}

// Singleton instance
export const syncService = new SyncService();