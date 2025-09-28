import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { series, mangaChapters, readingProgress, users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// Authentication helper matching existing pattern
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
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const { slug } = params;

    // Validate slug parameter
    if (!slug) {
      return NextResponse.json({ 
        error: 'Series slug is required',
        code: 'MISSING_SLUG' 
      }, { status: 400 });
    }

    // Find series by slug
    const seriesResult = await db.select({
      id: series.id,
      title: series.title
    })
      .from(series)
      .where(eq(series.slug, slug))
      .limit(1);

    if (seriesResult.length === 0) {
      return NextResponse.json({ 
        error: 'Series not found',
        code: 'SERIES_NOT_FOUND' 
      }, { status: 404 });
    }

    const seriesRecord = seriesResult[0];

    // Get total chapters count
    const totalChaptersResult = await db.select({ 
      count: sql`count(*)` 
    })
      .from(mangaChapters)
      .where(eq(mangaChapters.seriesId, seriesRecord.id));

    const totalChapters = Number(totalChaptersResult[0]?.count) || 0;

    // Get read chapters count for this user and series
    const readChaptersResult = await db.select({ 
      count: sql`count(*)` 
    })
      .from(readingProgress)
      .where(and(
        eq(readingProgress.userId, authResult.userId),
        eq(readingProgress.seriesId, seriesRecord.id)
      ));

    const readChapters = Number(readChaptersResult[0]?.count) || 0;

    // Calculate percentage
    const percentage = totalChapters > 0 
      ? Math.round((readChapters / totalChapters) * 100)
      : 0;

    // Check if up to date
    const isUpToDate = readChapters >= totalChapters && totalChapters > 0;

    return NextResponse.json({
      totalChapters,
      readChapters,
      percentage,
      isUpToDate
    });

  } catch (error) {
    console.error('GET /api/series/[slug]/stats error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}