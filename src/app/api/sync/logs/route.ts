import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { syncLogs, sources } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceId = searchParams.get('sourceId');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'));

    let query = db.select().from(syncLogs).orderBy(desc(syncLogs.startedAt)).limit(limit);

    if (sourceId) {
      const sid = parseInt(sourceId);
      if (!isNaN(sid)) {
        query = db.select().from(syncLogs).where(eq(syncLogs.sourceId, sid)).orderBy(desc(syncLogs.startedAt)).limit(limit);
      }
    }

    const logs = await query;

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('GET /api/sync/logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}