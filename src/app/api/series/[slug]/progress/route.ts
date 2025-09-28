import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { series, readingProgress, libraries, mangaChapters, users } from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
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

    const seriesSlug = params.slug;

    if (!seriesSlug) {
      return NextResponse.json({ 
        error: 'Series slug is required',
        code: 'MISSING_SERIES_SLUG' 
      }, { status: 400 });
    }

    // Find series by slug
    const seriesResult = await db.select({
      id: series.id,
      title: series.title,
      slug: series.slug
    })
      .from(series)
      .where(eq(series.slug, seriesSlug))
      .limit(1);

    if (seriesResult.length === 0) {
      return NextResponse.json({ 
        error: 'Series not found',
        code: 'SERIES_NOT_FOUND' 
      }, { status: 404 });
    }

    const seriesData = seriesResult[0];

    // Get total chapters count
    const totalChaptersResult = await db.select({ 
      count: sql`count(*)` 
    })
      .from(mangaChapters)
      .where(eq(mangaChapters.seriesId, seriesData.id));

    const totalChapters = Number(totalChaptersResult[0]?.count) || 0;

    // Get read chapters count
    const readChaptersResult = await db.select({ 
      count: sql`count(*)` 
    })
      .from(readingProgress)
      .innerJoin(mangaChapters, eq(readingProgress.chapterId, mangaChapters.id))
      .where(and(
        eq(readingProgress.userId, authResult.userId),
        eq(readingProgress.seriesId, seriesData.id)
      ));

    const readChapters = Number(readChaptersResult[0]?.count) || 0;

    // Get last read chapter
    const lastReadResult = await db.select({
      id: mangaChapters.id,
      number: mangaChapters.number,
      title: mangaChapters.title,
      readAt: readingProgress.readAt
    })
      .from(readingProgress)
      .innerJoin(mangaChapters, eq(readingProgress.chapterId, mangaChapters.id))
      .where(and(
        eq(readingProgress.userId, authResult.userId),
        eq(readingProgress.seriesId, seriesData.id)
      ))
      .orderBy(desc(readingProgress.readAt))
      .limit(1);

    const lastReadChapter = lastReadResult.length > 0 ? lastReadResult[0] : undefined;

    // Get library entry
    const libraryResult = await db.select({
      id: libraries.id,
      status: libraries.status,
      rating: libraries.rating,
      notes: libraries.notes
    })
      .from(libraries)
      .where(and(
        eq(libraries.userId, authResult.userId),
        eq(libraries.seriesId, seriesData.id)
      ))
      .limit(1);

    const libraryEntry = libraryResult.length > 0 ? libraryResult[0] : undefined;

    // Calculate progress
    const percentage = totalChapters > 0 ? Math.round((readChapters / totalChapters) * 100) : 0;
    
    // Check if up to date (read all available chapters)
    const isUpToDate = readChapters >= totalChapters && totalChapters > 0;

    const response = {
      seriesId: seriesData.id,
      userId: authResult.userId,
      totalChapters,
      readChapters,
      lastReadChapter,
      libraryEntry,
      progress: {
        percentage,
        isUpToDate
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('GET reading progress error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}