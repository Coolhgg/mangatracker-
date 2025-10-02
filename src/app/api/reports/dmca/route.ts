/**
 * POST /api/reports/dmca - Submit DMCA takedown report
 * 
 * Body:
 * - reporterName: string (required) - Name of reporter
 * - reporterEmail: string (required) - Email of reporter  
 * - complaintDetails: string (required) - Description of infringement
 * - reporterOrganization: string (optional) - Organization of reporter
 * - contentType: string (optional) - Type of content (series, episode, etc.)
 * - contentId: number (optional) - ID of content
 * - contentUrl: string (optional) - URL of content
 * - copyrightProof: string (optional) - Proof of copyright
 * 
 * Creates audit log entry and may auto-disable sources/series based on URL.
 * No email notification in Phase 1.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { dmcaReports } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));

    let query = db.select().from(dmcaReports).orderBy(desc(dmcaReports.createdAt)).limit(limit);

    if (status) {
      query = db.select()
        .from(dmcaReports)
        .where(eq(dmcaReports.status, status))
        .orderBy(desc(dmcaReports.createdAt))
        .limit(limit);
    }

    const reports = await query;

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('GET /api/reports/dmca error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.reporterName || !body.reporterEmail || !body.complaintDetails) {
      return NextResponse.json(
        { error: 'Missing required fields: reporterName, reporterEmail, complaintDetails' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.reporterEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Use raw SQL to avoid serialization issues
    await db.execute(sql`
      INSERT INTO dmca_reports (
        reporter_name, 
        reporter_email, 
        reporter_organization, 
        content_type, 
        content_url, 
        complaint_details, 
        status, 
        created_at
      ) VALUES (
        ${body.reporterName},
        ${body.reporterEmail},
        ${body.reporterOrganization || null},
        ${body.contentType || 'series'},
        ${body.contentUrl || null},
        ${body.complaintDetails},
        'pending',
        NOW()
      )
    `);

    // Get the last inserted report
    const [newReport] = await db
      .select()
      .from(dmcaReports)
      .orderBy(desc(dmcaReports.id))
      .limit(1);

    // TODO: Send email notification to admin
    console.log('[DMCA] New report submitted:', newReport?.id);

    return NextResponse.json({ 
      success: true,
      message: 'DMCA report submitted successfully. We will review your request within 24-48 hours.',
      reportId: newReport?.id 
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/reports/dmca error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}