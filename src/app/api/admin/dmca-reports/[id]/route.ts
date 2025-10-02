import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dmcaReports } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reportId = parseInt(id);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['pending', 'reviewing', 'resolved', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, reviewing, resolved, rejected' },
        { status: 400 }
      );
    }

    // Check if report exists
    const existingReport = await db.select()
      .from(dmcaReports)
      .where(eq(dmcaReports.id, reportId))
      .limit(1);

    if (existingReport.length === 0) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Update report
    const resolvedAt = (status === 'resolved' || status === 'rejected') 
      ? new Date().toISOString() 
      : null;

    const [updatedReport] = await db.update(dmcaReports)
      .set({ 
        status,
        resolvedAt
      })
      .where(eq(dmcaReports.id, reportId))
      .returning();

    console.log(`[DMCA] Report #${reportId} status updated to: ${status}`);

    return NextResponse.json({ 
      success: true,
      report: updatedReport 
    });
  } catch (error: any) {
    console.error('PATCH /api/admin/dmca-reports/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reportId = parseInt(id);

    if (isNaN(reportId)) {
      return NextResponse.json(
        { error: 'Invalid report ID' },
        { status: 400 }
      );
    }

    // Check if report exists
    const existingReport = await db.select()
      .from(dmcaReports)
      .where(eq(dmcaReports.id, reportId))
      .limit(1);

    if (existingReport.length === 0) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Delete report
    await db.delete(dmcaReports)
      .where(eq(dmcaReports.id, reportId));

    console.log(`[DMCA] Report #${reportId} deleted`);

    return NextResponse.json({ 
      success: true,
      message: 'Report deleted successfully' 
    });
  } catch (error: any) {
    console.error('DELETE /api/admin/dmca-reports/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}