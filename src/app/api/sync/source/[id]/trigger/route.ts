import { NextRequest, NextResponse } from 'next/server';
import { syncService } from '@/lib/worker/sync-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sourceId = parseInt(params.id);
    if (isNaN(sourceId)) {
      return NextResponse.json({ error: 'Invalid source ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const full = Boolean(body.full);

    // Schedule the sync job
    await syncService.scheduleSyncJob(sourceId, full);

    return NextResponse.json({ 
      ok: true, 
      message: `Sync job scheduled for source ${sourceId}`,
      full 
    });
  } catch (error: any) {
    console.error('POST /api/sync/source/[id]/trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}