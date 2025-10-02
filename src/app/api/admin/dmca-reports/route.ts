import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dmcaReports } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const reports = await db
      .select()
      .from(dmcaReports)
      .orderBy(desc(dmcaReports.createdAt));

    return NextResponse.json({
      success: true,
      reports: reports.map(report => ({
        id: report.id,
        reporterName: report.reporterName,
        reporterEmail: report.reporterEmail,
        reporterOrganization: report.reporterOrganization,
        contentType: report.contentType,
        contentUrl: report.contentUrl,
        complaintDetails: report.complaintDetails,
        status: report.status,
        createdAt: report.createdAt,
        resolvedAt: report.resolvedAt,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch DMCA reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch DMCA reports' },
      { status: 500 }
    );
  }
}