import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { library, series, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// Authentication helper
async function authenticate(request: NextRequest) {
  // Try cookie-based session first
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (session?.user?.id) {
      const userRecord = await db.select()
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);
      
      if (userRecord.length > 0) {
        return { userId: userRecord[0].id };
      }
    }
  } catch (e) {
    // Cookie session failed, try bearer token
  }

  // Try Bearer token (numeric user ID)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const userId = parseInt(token);
    
    if (!isNaN(userId)) {
      const userRecord = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (userRecord.length > 0) {
        return { userId: userRecord[0].id };
      }
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;

    // Find series by slug
    const seriesResult = await db.select()
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesResult.length === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const seriesRecord = seriesResult[0];

    // Get user's library entry for this series
    const libraryEntry = await db.select()
      .from(library)
      .where(and(
        eq(library.userId, authResult.userId),
        eq(library.seriesId, seriesRecord.id)
      ))
      .limit(1);

    const status = libraryEntry.length > 0 ? libraryEntry[0].status : null;

    return NextResponse.json({ status });

  } catch (error) {
    console.error('GET /api/series/[slug]/library error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['reading', 'completed', 'plan_to_read', 'on_hold', 'dropped'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
        code: 'INVALID_STATUS'
      }, { status: 400 });
    }

    // Find series by slug
    const seriesResult = await db.select()
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesResult.length === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const seriesRecord = seriesResult[0];

    // Check if library entry already exists
    const existingEntry = await db.select()
      .from(library)
      .where(and(
        eq(library.userId, authResult.userId),
        eq(library.seriesId, seriesRecord.id)
      ))
      .limit(1);

    const now = Date.now();

    if (existingEntry.length > 0) {
      // Update existing entry
      await db.update(library)
        .set({ status })
        .where(and(
          eq(library.userId, authResult.userId),
          eq(library.seriesId, seriesRecord.id)
        ));
    } else {
      // Create new entry
      await db.insert(library)
        .values({
          userId: authResult.userId,
          seriesId: seriesRecord.id,
          status,
          createdAt: now
        });
    }

    return NextResponse.json({ status });

  } catch (error) {
    console.error('POST /api/series/[slug]/library error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Authentication required
    const authResult = await authenticate(request);
    if (!authResult) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { slug } = params;

    // Find series by slug
    const seriesResult = await db.select()
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesResult.length === 0) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const seriesRecord = seriesResult[0];

    // Delete library entry
    const deleted = await db.delete(library)
      .where(and(
        eq(library.userId, authResult.userId),
        eq(library.seriesId, seriesRecord.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Series not in library' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Series removed from library'
    });

  } catch (error) {
    console.error('DELETE /api/series/[slug]/library error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}